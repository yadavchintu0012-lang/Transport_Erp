"""
SaaS Administration API
All routes protected by require_superadmin — accessible ONLY to platform super-admins.
Tenant users have no access to ANY of these endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import csv, io

from app.core.database import get_db
from app.core.dependencies import require_superadmin, CurrentContext
from app.models.entities import (
    Organization, User, OrganizationMembership, Role,
    Subscription, SubscriptionPlan, SaasAdminNote, AuditLog,
    Vehicle, Driver, Trip, Invoice
)
from app.services.audit import log_audit

router = APIRouter(prefix="/admin/saas", tags=["SaaS Admin"])


def _utc_now():
    return datetime.now(timezone.utc)


# ─────────────────────────────────────────────
# DASHBOARD — Platform KPIs & Metrics
# ─────────────────────────────────────────────

@router.get("/dashboard")
def saas_dashboard(
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    since = _utc_now() - timedelta(days=days)
    month_start = _utc_now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    year_start = _utc_now().replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    total_orgs = db.query(func.count(Organization.id)).scalar() or 0
    active_orgs = db.query(func.count(Organization.id)).filter(Organization.is_active == True).scalar() or 0
    suspended_orgs = db.query(func.count(Organization.id)).filter(Organization.is_active == False).scalar() or 0
    demo_orgs = db.query(func.count(Organization.id)).filter(Organization.is_demo == True).scalar() or 0
    new_this_month = db.query(func.count(Organization.id)).filter(Organization.created_at >= month_start).scalar() or 0
    new_in_range = db.query(func.count(Organization.id)).filter(Organization.created_at >= since).scalar() or 0

    # Subscription stats
    subs = db.query(Subscription).all()
    trial_count = sum(1 for s in subs if s.status == "trial")
    active_paid = sum(1 for s in subs if s.status == "active")
    cancelled_count = sum(1 for s in subs if s.status in ("canceled", "cancelled"))
    suspended_count = sum(1 for s in subs if s.status == "suspended")
    expired_count = sum(1 for s in subs if s.expiry_date and s.expiry_date < _utc_now() and s.status == "active")

    # Revenue — only count amount_paid (verified collected revenue)
    total_revenue = db.query(func.sum(Subscription.amount_paid)).scalar() or 0.0

    # MRR: sum of monthly price of all active paid subscriptions
    active_subs_with_plan = db.query(Subscription).options(joinedload(Subscription.plan)).filter(
        Subscription.status == "active"
    ).all()
    mrr = sum(
        (s.plan.price_monthly if s.plan and s.billing_cycle == "monthly" else
         (s.plan.price_yearly / 12 if s.plan and s.plan.price_yearly else 0))
        for s in active_subs_with_plan
    )
    arr = mrr * 12

    # Trial to paid conversion rate
    total_trials_ever = db.query(func.count(Subscription.id)).filter(
        Subscription.trial_end_date != None
    ).scalar() or 0
    converted = db.query(func.count(Subscription.id)).filter(
        Subscription.trial_end_date != None,
        Subscription.status == "active",
        Subscription.amount_paid > 0
    ).scalar() or 0
    conversion_rate = round((converted / total_trials_ever * 100) if total_trials_ever > 0 else 0, 1)

    # Plan distribution
    plan_dist = []
    plans = db.query(SubscriptionPlan).all()
    for plan in plans:
        count = db.query(func.count(Subscription.id)).filter(
            Subscription.plan_id == plan.id
        ).scalar() or 0
        plan_dist.append({"plan": plan.name, "count": count, "code": plan.code})

    # Registrations over time (last N days, grouped by day)
    registrations_chart = []
    for i in range(min(days, 30), 0, -1):
        day_start = _utc_now() - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        cnt = db.query(func.count(Organization.id)).filter(
            Organization.created_at >= day_start,
            Organization.created_at < day_end
        ).scalar() or 0
        registrations_chart.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "registrations": cnt
        })

    return {
        "period_days": days,
        "companies": {
            "total": total_orgs,
            "active": active_orgs,
            "suspended": suspended_orgs,
            "demo": demo_orgs,
            "new_this_month": new_this_month,
            "new_in_period": new_in_range,
        },
        "subscriptions": {
            "trial": trial_count,
            "active_paid": active_paid,
            "cancelled": cancelled_count,
            "suspended": suspended_count,
            "expired": expired_count,
            "trial_to_paid_conversion_pct": conversion_rate,
        },
        "revenue": {
            "total_collected": round(total_revenue, 2),
            "mrr": round(mrr, 2),
            "arr": round(arr, 2),
        },
        "plan_distribution": plan_dist,
        "registrations_chart": registrations_chart,
    }


# ─────────────────────────────────────────────
# ACCOUNTS — All tenant organizations
# ─────────────────────────────────────────────

@router.get("/accounts")
def list_accounts(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),  # active, suspended
    plan_code: Optional[str] = Query(None),
    sub_status: Optional[str] = Query(None),  # active, trial, canceled, suspended
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=5, le=100),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    query = db.query(Organization)

    if search:
        s = f"%{search}%"
        query = query.filter(or_(
            Organization.name.ilike(s),
            Organization.email.ilike(s),
            Organization.phone.ilike(s),
            Organization.id.ilike(s)
        ))
    if status == "active":
        query = query.filter(Organization.is_active == True)
    elif status == "suspended":
        query = query.filter(Organization.is_active == False)

    if plan_code or sub_status:
        query = query.join(Subscription, Subscription.organization_id == Organization.id, isouter=True)
        if plan_code:
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == plan_code).first()
            if plan:
                query = query.filter(Subscription.plan_id == plan.id)
        if sub_status:
            query = query.filter(Subscription.status == sub_status)

    total = query.count()

    sort_col = getattr(Organization, sort_by, Organization.created_at)
    if sort_dir == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    orgs = query.offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for org in orgs:
        sub = db.query(Subscription).options(joinedload(Subscription.plan)).filter(
            Subscription.organization_id == org.id
        ).first()
        owner_membership = db.query(OrganizationMembership).join(Role).filter(
            OrganizationMembership.organization_id == org.id,
            Role.code == "owner"
        ).first()
        owner_user = db.query(User).filter(User.id == owner_membership.user_id).first() if owner_membership else None
        user_count = db.query(func.count(OrganizationMembership.id)).filter(
            OrganizationMembership.organization_id == org.id,
            OrganizationMembership.is_active == True
        ).scalar() or 0
        vehicle_count = db.query(func.count(Vehicle.id)).filter(Vehicle.organization_id == org.id).scalar() or 0

        results.append({
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "email": org.email,
            "phone": org.phone,
            "city": org.city,
            "state": org.state,
            "tax_number": org.tax_number,
            "is_active": org.is_active,
            "is_demo": org.is_demo,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "owner_name": owner_user.full_name if owner_user else None,
            "owner_email": owner_user.email if owner_user else None,
            "owner_last_login": owner_user.last_login_at.isoformat() if owner_user and owner_user.last_login_at else None,
            "user_count": user_count,
            "vehicle_count": vehicle_count,
            "subscription": {
                "status": sub.status if sub else None,
                "billing_cycle": sub.billing_cycle if sub else None,
                "start_date": sub.start_date.isoformat() if sub and sub.start_date else None,
                "expiry_date": sub.expiry_date.isoformat() if sub and sub.expiry_date else None,
                "trial_end_date": sub.trial_end_date.isoformat() if sub and sub.trial_end_date else None,
                "amount_paid": sub.amount_paid if sub else 0,
                "plan_name": sub.plan.name if sub and sub.plan else None,
                "plan_code": sub.plan.code if sub and sub.plan else None,
                "price_monthly": sub.plan.price_monthly if sub and sub.plan else 0,
            } if sub else None,
        })

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "accounts": results
    }


@router.get("/accounts/export-csv")
def export_accounts_csv(
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    orgs = db.query(Organization).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Phone", "City", "State", "GSTIN", "Status", "Demo", "Created At", "Plan", "Sub Status"])

    for org in orgs:
        sub = db.query(Subscription).options(joinedload(Subscription.plan)).filter(
            Subscription.organization_id == org.id
        ).first()
        writer.writerow([
            org.id, org.name, org.email, org.phone, org.city, org.state,
            org.tax_number, "Active" if org.is_active else "Suspended",
            "Yes" if org.is_demo else "No",
            org.created_at.strftime("%Y-%m-%d") if org.created_at else "",
            sub.plan.name if sub and sub.plan else "",
            sub.status if sub else ""
        ])

    output.seek(0)
    log_audit(db, "saas_export_accounts_csv", None, ctx.user.id, "System", None, {})
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=accounts.csv"}
    )


@router.get("/accounts/{org_id}")
def get_account_detail(
    org_id: str,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    sub = db.query(Subscription).options(joinedload(Subscription.plan)).filter(
        Subscription.organization_id == org_id
    ).first()

    memberships = db.query(OrganizationMembership).options(
        joinedload(OrganizationMembership.user),
        joinedload(OrganizationMembership.role)
    ).filter(OrganizationMembership.organization_id == org_id).all()

    vehicle_count = db.query(func.count(Vehicle.id)).filter(Vehicle.organization_id == org_id).scalar() or 0
    driver_count = db.query(func.count(Driver.id)).filter(Driver.organization_id == org_id).scalar() or 0
    trip_count = db.query(func.count(Trip.id)).filter(Trip.organization_id == org_id).scalar() or 0
    invoice_count = db.query(func.count(Invoice.id)).filter(Invoice.organization_id == org_id).scalar() or 0

    recent_audit = db.query(AuditLog).filter(
        AuditLog.organization_id == org_id
    ).order_by(AuditLog.created_at.desc()).limit(20).all()

    notes = db.query(SaasAdminNote).options(joinedload(SaasAdminNote.created_by)).filter(
        SaasAdminNote.organization_id == org_id
    ).order_by(SaasAdminNote.created_at.desc()).all()

    return {
        "organization": {
            "id": org.id, "name": org.name, "slug": org.slug,
            "email": org.email, "phone": org.phone,
            "address": org.address, "city": org.city,
            "state": org.state, "postal_code": org.postal_code,
            "country": org.country, "tax_number": org.tax_number,
            "currency": org.currency, "logo_url": org.logo_url,
            "is_active": org.is_active, "is_demo": org.is_demo,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "updated_at": org.updated_at.isoformat() if org.updated_at else None,
        },
        "subscription": {
            "id": sub.id if sub else None,
            "status": sub.status if sub else None,
            "billing_cycle": sub.billing_cycle if sub else None,
            "start_date": sub.start_date.isoformat() if sub and sub.start_date else None,
            "trial_end_date": sub.trial_end_date.isoformat() if sub and sub.trial_end_date else None,
            "expiry_date": sub.expiry_date.isoformat() if sub and sub.expiry_date else None,
            "auto_renew": sub.auto_renew if sub else None,
            "suspended_at": sub.suspended_at.isoformat() if sub and sub.suspended_at else None,
            "cancelled_at": sub.cancelled_at.isoformat() if sub and sub.cancelled_at else None,
            "cancellation_reason": sub.cancellation_reason if sub else None,
            "amount_paid": sub.amount_paid if sub else 0,
            "plan": {
                "id": sub.plan.id, "name": sub.plan.name, "code": sub.plan.code,
                "price_monthly": sub.plan.price_monthly, "price_yearly": sub.plan.price_yearly,
                "max_vehicles": sub.plan.max_vehicles, "max_staff": sub.plan.max_staff,
                "max_trips_monthly": sub.plan.max_trips_monthly, "features": sub.plan.features,
            } if sub and sub.plan else None,
        } if sub else None,
        "members": [
            {
                "user_id": m.user_id,
                "full_name": m.user.full_name if m.user else "",
                "email": m.user.email if m.user else "",
                "phone": m.user.phone if m.user else "",
                "role": m.role.name if m.role else "",
                "role_code": m.role.code if m.role else "",
                "is_active": m.is_active,
                "joined_at": m.joined_at.isoformat() if m.joined_at else None,
                "last_login": m.user.last_login_at.isoformat() if m.user and m.user.last_login_at else None,
            }
            for m in memberships
        ],
        "usage": {
            "vehicles": vehicle_count,
            "drivers": driver_count,
            "trips": trip_count,
            "invoices": invoice_count,
            "plan_limits": {
                "max_vehicles": sub.plan.max_vehicles if sub and sub.plan else None,
                "max_staff": sub.plan.max_staff if sub and sub.plan else None,
                "max_trips_monthly": sub.plan.max_trips_monthly if sub and sub.plan else None,
            } if sub and sub.plan else {}
        },
        "recent_activity": [
            {
                "action": a.action, "entity": a.entity_name,
                "entity_id": a.entity_id, "details": a.details,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "user_id": a.user_id
            }
            for a in recent_audit
        ],
        "admin_notes": [
            {
                "id": n.id, "note": n.note, "category": n.category,
                "created_by": n.created_by.full_name if n.created_by else "Admin",
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notes
        ]
    }


@router.patch("/accounts/{org_id}/suspend")
def suspend_account(
    org_id: str,
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    if not org.is_active:
        raise HTTPException(status_code=400, detail="Account is already suspended.")
    if org.is_demo:
        raise HTTPException(status_code=400, detail="Cannot suspend the demo organization.")

    reason = body.get("reason", "Suspended by platform admin")
    org.is_active = False
    sub = db.query(Subscription).filter(Subscription.organization_id == org_id).first()
    if sub:
        sub.status = "suspended"
        sub.suspended_at = _utc_now()
        sub.admin_notes = reason

    db.commit()
    log_audit(db, "saas_suspend_account", None, ctx.user.id, "Organization", org_id, {"reason": reason})
    return {"success": True, "message": f"Organization '{org.name}' has been suspended."}


@router.patch("/accounts/{org_id}/activate")
def activate_account(
    org_id: str,
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    if org.is_active:
        raise HTTPException(status_code=400, detail="Account is already active.")

    org.is_active = True
    sub = db.query(Subscription).filter(Subscription.organization_id == org_id).first()
    if sub and sub.status == "suspended":
        sub.status = "active"
        sub.suspended_at = None

    db.commit()
    log_audit(db, "saas_activate_account", None, ctx.user.id, "Organization", org_id, {})
    return {"success": True, "message": f"Organization '{org.name}' has been reactivated."}


@router.patch("/accounts/{org_id}/plan")
def change_plan(
    org_id: str,
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    new_plan_code = body.get("plan_code")
    reason = body.get("reason", "Plan changed by admin")
    if not new_plan_code:
        raise HTTPException(status_code=400, detail="plan_code is required.")

    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == new_plan_code).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Plan '{new_plan_code}' not found.")

    sub = db.query(Subscription).filter(Subscription.organization_id == org_id).first()
    if not sub:
        # Create subscription if it doesn't exist
        sub = Subscription(organization_id=org_id, plan_id=plan.id, status="active")
        db.add(sub)
    else:
        old_plan = sub.plan.code if sub.plan else "none"
        sub.plan_id = plan.id
        sub.admin_notes = f"Plan changed from {old_plan} to {new_plan_code}. Reason: {reason}"

    db.commit()
    log_audit(db, "saas_change_plan", None, ctx.user.id, "Subscription", sub.id, {
        "new_plan": new_plan_code, "reason": reason
    })
    return {"success": True, "message": f"Plan changed to '{plan.name}'."}


@router.post("/accounts/{org_id}/notes")
def add_admin_note(
    org_id: str,
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    note_text = body.get("note", "").strip()
    if not note_text:
        raise HTTPException(status_code=400, detail="Note cannot be empty.")

    note = SaasAdminNote(
        organization_id=org_id,
        created_by_user_id=ctx.user.id,
        note=note_text,
        category=body.get("category", "general")
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {
        "id": note.id, "note": note.note, "category": note.category,
        "created_by": ctx.user.full_name,
        "created_at": note.created_at.isoformat()
    }


# ─────────────────────────────────────────────
# PLANS — Manage subscription plans
# ─────────────────────────────────────────────

@router.get("/plans")
def list_all_plans(
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    plans = db.query(SubscriptionPlan).order_by(SubscriptionPlan.sort_order, SubscriptionPlan.price_monthly).all()
    result = []
    for p in plans:
        sub_count = db.query(func.count(Subscription.id)).filter(Subscription.plan_id == p.id).scalar() or 0
        result.append({
            "id": p.id, "name": p.name, "code": p.code,
            "description": p.description,
            "price_monthly": p.price_monthly, "price_yearly": p.price_yearly,
            "trial_days": p.trial_days,
            "max_vehicles": p.max_vehicles, "max_staff": p.max_staff,
            "max_trips_monthly": p.max_trips_monthly,
            "features": p.features, "is_active": p.is_active,
            "is_visible": p.is_visible, "sort_order": p.sort_order,
            "subscriber_count": sub_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return result


@router.post("/plans")
def create_plan(
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    if db.query(SubscriptionPlan).filter(SubscriptionPlan.code == body.get("code")).first():
        raise HTTPException(status_code=400, detail="A plan with this code already exists.")

    plan = SubscriptionPlan(
        name=body.get("name"),
        code=body.get("code"),
        description=body.get("description"),
        price_monthly=body.get("price_monthly", 0),
        price_yearly=body.get("price_yearly", 0),
        trial_days=body.get("trial_days", 14),
        max_vehicles=body.get("max_vehicles", 5),
        max_staff=body.get("max_staff", 3),
        max_trips_monthly=body.get("max_trips_monthly", 50),
        features=body.get("features", []),
        is_active=body.get("is_active", True),
        is_visible=body.get("is_visible", True),
        sort_order=body.get("sort_order", 0),
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    log_audit(db, "saas_create_plan", None, ctx.user.id, "SubscriptionPlan", plan.id, {"name": plan.name})
    return {"success": True, "id": plan.id}


@router.patch("/plans/{plan_id}")
def update_plan(
    plan_id: str,
    body: dict,
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found.")

    for field in ["name", "description", "price_monthly", "price_yearly", "trial_days",
                  "max_vehicles", "max_staff", "max_trips_monthly", "features",
                  "is_active", "is_visible", "sort_order"]:
        if field in body:
            setattr(plan, field, body[field])

    db.commit()
    log_audit(db, "saas_update_plan", None, ctx.user.id, "SubscriptionPlan", plan_id, body)
    return {"success": True}


# ─────────────────────────────────────────────
# ANALYTICS — Aggregated charts data
# ─────────────────────────────────────────────

@router.get("/analytics")
def saas_analytics(
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    # Top 10 orgs by revenue
    top_orgs = db.query(
        Organization.name, Subscription.amount_paid
    ).join(Subscription, Subscription.organization_id == Organization.id).order_by(
        Subscription.amount_paid.desc()
    ).limit(10).all()

    # Monthly new registrations for last 12 months
    monthly_regs = []
    for i in range(11, -1, -1):
        ref = _utc_now().replace(day=1) - timedelta(days=i * 30)
        m_start = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i > 0:
            m_end = (_utc_now().replace(day=1) - timedelta(days=(i - 1) * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            m_end = _utc_now()
        cnt = db.query(func.count(Organization.id)).filter(
            Organization.created_at >= m_start,
            Organization.created_at < m_end
        ).scalar() or 0
        monthly_regs.append({"month": m_start.strftime("%b %Y"), "count": cnt})

    # Status breakdown
    status_breakdown = [
        {"status": "Active", "count": db.query(func.count(Organization.id)).filter(Organization.is_active == True).scalar() or 0},
        {"status": "Suspended", "count": db.query(func.count(Organization.id)).filter(Organization.is_active == False).scalar() or 0},
    ]

    sub_status_breakdown = []
    for s in ["active", "trial", "suspended", "canceled", "past_due"]:
        cnt = db.query(func.count(Subscription.id)).filter(Subscription.status == s).scalar() or 0
        sub_status_breakdown.append({"status": s, "count": cnt})

    return {
        "top_orgs_by_revenue": [{"name": o[0], "revenue": o[1]} for o in top_orgs],
        "monthly_registrations": monthly_regs,
        "company_status_breakdown": status_breakdown,
        "subscription_status_breakdown": sub_status_breakdown,
    }


# ─────────────────────────────────────────────
# AUDIT LOGS — Platform-level admin actions
# ─────────────────────────────────────────────

@router.get("/audit-logs")
def platform_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=10, le=100),
    db: Session = Depends(get_db),
    ctx: CurrentContext = Depends(require_superadmin)
):
    # Logs where org_id is null = platform-level actions by super-admin
    query = db.query(AuditLog).filter(
        or_(
            AuditLog.organization_id == None,
            AuditLog.action.like("saas_%")
        )
    ).order_by(AuditLog.created_at.desc())

    total = query.count()
    logs = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "logs": [
            {
                "id": l.id, "action": l.action, "entity": l.entity_name,
                "entity_id": l.entity_id, "details": l.details,
                "user_id": l.user_id, "ip_address": l.ip_address,
                "created_at": l.created_at.isoformat() if l.created_at else None
            }
            for l in logs
        ]
    }
