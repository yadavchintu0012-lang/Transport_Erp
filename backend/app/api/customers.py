from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional

from app.core.database import get_db
from app.models.entities import Customer, Trip, Invoice
from app.schemas.all_schemas import CustomerCreateRequest, CustomerUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/")
def list_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("customers", "view"))
):
    query = db.query(Customer).filter(Customer.organization_id == context.organization_id)
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.tax_number.ilike(f"%{search}%"),
                Customer.city.ilike(f"%{search}%")
            )
        )
    customers = query.order_by(Customer.name.asc()).all()

    results = []
    for c in customers:
        # Calculate customer balance: Sum of all invoice balances
        invoices = db.query(Invoice).filter(
            Invoice.customer_id == c.id,
            Invoice.organization_id == context.organization_id
        ).all()
        outstanding_balance = sum(inv.balance_amount for inv in invoices) + (c.opening_balance or 0.0)
        total_billed = sum(inv.total_amount for inv in invoices)
        trip_count = db.query(Trip).filter(Trip.customer_id == c.id).count()

        results.append({
            "id": c.id,
            "name": c.name,
            "customer_type": c.customer_type,
            "contact_person": c.contact_person,
            "phone": c.phone,
            "email": c.email,
            "billing_address": c.billing_address,
            "city": c.city,
            "state": c.state,
            "tax_number": c.tax_number,
            "credit_limit": c.credit_limit,
            "opening_balance": c.opening_balance,
            "outstanding_balance": outstanding_balance,
            "total_billed": total_billed,
            "total_trips": trip_count,
            "status": c.status
        })
    return results

@router.post("/")
def create_customer(
    data: CustomerCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("customers", "create"))
):
    customer = Customer(
        organization_id=context.organization_id,
        name=data.name.strip(),
        customer_type=data.customer_type,
        contact_person=data.contact_person,
        phone=data.phone,
        email=data.email.strip().lower() if data.email else None,
        billing_address=data.billing_address,
        city=data.city,
        state=data.state,
        tax_number=data.tax_number.upper().strip() if data.tax_number else None,
        credit_limit=data.credit_limit or 0.0,
        opening_balance=data.opening_balance or 0.0,
        status="active"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    log_audit(db, "customer_create", context.organization_id, context.user.id, "Customer", customer.id, {"name": customer.name})
    return customer

@router.put("/{customer_id}")
def update_customer(
    customer_id: str,
    data: CustomerUpdateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("customers", "edit"))
):
    c = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == context.organization_id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found.")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(c, field, val)

    db.commit()
    log_audit(db, "customer_update", context.organization_id, context.user.id, "Customer", c.id)
    return {"message": "Customer updated successfully"}

@router.get("/{customer_id}/statement")
def get_customer_statement(
    customer_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("customers", "view"))
):
    c = db.query(Customer).filter(
        Customer.id == customer_id,
        Customer.organization_id == context.organization_id
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found.")

    trips = db.query(Trip).filter(Trip.customer_id == customer_id).order_by(Trip.trip_date.desc()).all()
    invoices = db.query(Invoice).filter(Invoice.customer_id == customer_id).order_by(Invoice.invoice_date.desc()).all()

    return {
        "customer": {
            "id": c.id,
            "name": c.name,
            "tax_number": c.tax_number,
            "phone": c.phone,
            "billing_address": c.billing_address
        },
        "invoices": [
            {
                "invoice_number": inv.invoice_number,
                "invoice_date": inv.invoice_date.isoformat(),
                "due_date": inv.due_date.isoformat(),
                "total_amount": inv.total_amount,
                "paid_amount": inv.paid_amount,
                "balance_amount": inv.balance_amount,
                "status": inv.status
            } for inv in invoices
        ],
        "trips": [
            {
                "trip_number": t.trip_number,
                "trip_date": t.trip_date.isoformat(),
                "route": f"{t.pickup_city} -> {t.delivery_city}",
                "total_revenue": t.total_revenue,
                "status": t.status
            } for t in trips
        ]
    }
