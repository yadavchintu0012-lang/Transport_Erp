from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.entities import Trip, Vehicle, Driver, Customer, Expense, AuditLog
from app.schemas.all_schemas import TripCreateRequest, TripUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/trips", tags=["Trips"])

def generate_trip_number(db: Session, org_id: str) -> str:
    count = db.query(Trip).filter(Trip.organization_id == org_id).count() + 1
    year = datetime.now().year
    return f"TRP-{year}-{count:04d}"

@router.get("/")
def list_trips(
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("trips", "view"))
):
    query = db.query(Trip).filter(Trip.organization_id == context.organization_id)

    if status:
        query = query.filter(Trip.status == status)
    if customer_id:
        query = query.filter(Trip.customer_id == customer_id)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)
    if start_date:
        query = query.filter(Trip.trip_date >= start_date)
    if end_date:
        query = query.filter(Trip.trip_date <= end_date)
    if search:
        query = query.filter(
            or_(
                Trip.trip_number.ilike(f"%{search}%"),
                Trip.pickup_city.ilike(f"%{search}%"),
                Trip.delivery_city.ilike(f"%{search}%"),
                Trip.cargo_description.ilike(f"%{search}%"),
                Trip.customer_po_ref.ilike(f"%{search}%")
            )
        )

    total = query.count()
    trips = query.order_by(Trip.trip_date.desc()).offset((page - 1) * limit).limit(limit).all()

    # Determine if user has permission to view financials and profit
    can_view_financials = (
        context.is_superadmin or
        (context.role and context.role.code == "owner") or
        "view_financials" in context.permissions.get("trips", [])
    )
    can_view_profit = (
        context.is_superadmin or
        (context.role and context.role.code == "owner") or
        "view_profit" in context.permissions.get("trips", [])
    )

    items = []
    for t in trips:
        v = t.vehicle
        d = t.driver
        c = t.customer

        item = {
            "id": t.id,
            "trip_number": t.trip_number,
            "trip_date": t.trip_date.isoformat() if t.trip_date else None,
            "status": t.status,
            "is_approved": t.is_approved,
            "customer": {"id": c.id, "name": c.name} if c else None,
            "vehicle": {"id": v.id, "vehicle_number": v.vehicle_number, "vehicle_type": v.vehicle_type} if v else None,
            "driver": {"id": d.id, "name": d.name, "phone": d.phone} if d else None,
            "route": {
                "pickup_city": t.pickup_city,
                "pickup_address": t.pickup_address,
                "delivery_city": t.delivery_city,
                "delivery_address": t.delivery_address
            },
            "cargo": {
                "description": t.cargo_description,
                "weight_tonnes": t.cargo_weight_tonnes,
                "customer_po_ref": t.customer_po_ref
            },
            "cancellation_reason": t.cancellation_reason
        }

        if can_view_financials:
            item["financials"] = {
                "freight_charges": t.freight_charges,
                "additional_charges": t.additional_charges,
                "discount": t.discount,
                "tax_amount": t.tax_amount,
                "total_revenue": t.total_revenue,
                "amount_paid": t.amount_paid or 0.0,
                "due_amount": (t.total_revenue - (t.amount_paid or 0.0)) if t.due_amount is None else t.due_amount,
                "diesel_expense": t.diesel_expense,
                "toll_expense": t.toll_expense,
                "driver_allowance": t.driver_allowance,
                "loading_unloading_expense": t.loading_unloading_expense,
                "other_direct_expense": t.other_direct_expense,
                "total_expenses": t.total_expenses
            }
        if can_view_profit:
            item["profit"] = t.trip_profit

        items.append(item)

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.post("/")
def create_trip(
    data: TripCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("trips", "create"))
):
    # 1. Check vehicle availability (Prevent conflicting active assignments)
    active_vehicle_trip = db.query(Trip).filter(
        Trip.organization_id == context.organization_id,
        Trip.vehicle_id == data.vehicle_id,
        Trip.status.in_(["dispatched", "in_transit"])
    ).first()
    if active_vehicle_trip:
        raise HTTPException(
            status_code=400,
            detail=f"Vehicle is already assigned to active trip {active_vehicle_trip.trip_number}. Complete or update that trip first."
        )

    # 2. Check driver availability
    active_driver_trip = db.query(Trip).filter(
        Trip.organization_id == context.organization_id,
        Trip.driver_id == data.driver_id,
        Trip.status.in_(["dispatched", "in_transit"])
    ).first()
    if active_driver_trip:
        raise HTTPException(
            status_code=400,
            detail=f"Driver is already assigned to active trip {active_driver_trip.trip_number}."
        )

    # 3. Compute revenue, paid and direct expenses
    total_rev = data.freight_charges + data.additional_charges + data.tax_amount - data.discount
    paid = data.amount_paid if data.amount_paid is not None else 0.0
    due = data.due_amount if data.due_amount is not None else max(0.0, total_rev - paid)

    total_exp = (
        data.diesel_expense +
        data.toll_expense +
        data.driver_allowance +
        data.loading_unloading_expense +
        data.other_direct_expense
    )
    # Trip Profit = Revenue excluding collected tax - Direct Trip Expenses
    trip_prof = (total_rev - data.tax_amount) - total_exp

    trip_no = generate_trip_number(db, context.organization_id)

    trip = Trip(
        organization_id=context.organization_id,
        trip_number=trip_no,
        trip_date=data.trip_date,
        customer_id=data.customer_id,
        vehicle_id=data.vehicle_id,
        driver_id=data.driver_id,
        customer_po_ref=data.customer_po_ref,
        pickup_city=data.pickup_city.strip(),
        pickup_address=data.pickup_address,
        delivery_city=data.delivery_city.strip(),
        delivery_address=data.delivery_address,
        cargo_description=data.cargo_description,
        cargo_weight_tonnes=data.cargo_weight_tonnes or 0.0,
        freight_charges=data.freight_charges,
        additional_charges=data.additional_charges,
        discount=data.discount,
        tax_amount=data.tax_amount,
        total_revenue=total_rev,
        amount_paid=paid,
        due_amount=due,
        diesel_expense=data.diesel_expense,
        toll_expense=data.toll_expense,
        driver_allowance=data.driver_allowance,
        loading_unloading_expense=data.loading_unloading_expense,
        other_direct_expense=data.other_direct_expense,
        total_expenses=total_exp,
        trip_profit=trip_prof,
        status="dispatched",
        created_by_user_id=context.user.id
    )
    db.add(trip)

    # Update vehicle & driver status
    veh = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if veh:
        veh.status = "on_trip"
    drv = db.query(Driver).filter(Driver.id == data.driver_id).first()
    if drv:
        drv.status = "on_trip"

    db.commit()
    db.refresh(trip)

    log_audit(db, "trip_create", context.organization_id, context.user.id, "Trip", trip.id, {"trip_number": trip.trip_number})
    return {
        "id": trip.id,
        "trip_number": trip.trip_number,
        "trip_date": trip.trip_date.isoformat(),
        "status": trip.status,
        "amount_paid": trip.amount_paid or 0.0,
        "due_amount": trip.due_amount or 0.0,
        "total_revenue": trip.total_revenue
    }

@router.put("/{trip_id}/status")
def update_trip_status(
    trip_id: str,
    status_value: str, # dispatched, in_transit, delivered, completed, cancelled
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("trips", "edit"))
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.organization_id == context.organization_id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    valid_statuses = ["scheduled", "dispatched", "in_transit", "delivered", "completed", "cancelled"]
    if status_value not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value.")

    trip.status = status_value
    if status_value == "cancelled":
        trip.cancellation_reason = reason or "Cancelled by operator"

    # If completed or cancelled, release vehicle and driver
    if status_value in ["completed", "cancelled", "delivered"]:
        veh = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if veh and veh.status == "on_trip":
            veh.status = "available"
        drv = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if drv and drv.status == "on_trip":
            drv.status = "available"

    db.commit()
    log_audit(db, "trip_status_change", context.organization_id, context.user.id, "Trip", trip.id, {"status": status_value})
    return {"message": f"Trip status updated to {status_value}"}

@router.put("/{trip_id}/approve")
def approve_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("trips", "approve"))
):
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.organization_id == context.organization_id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    trip.is_approved = True
    trip.approved_by = context.user.id
    db.commit()

    log_audit(db, "trip_approve", context.organization_id, context.user.id, "Trip", trip.id)
    return {"message": "Trip approved successfully"}

@router.get("/{trip_id}/invoice")
def get_or_create_trip_invoice(
    trip_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("trips", "view"))
):
    from app.models.entities import Invoice, Payment
    from app.api.invoices import generate_invoice_number, generate_payment_number
    from datetime import timedelta

    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.organization_id == context.organization_id
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")

    invoice = db.query(Invoice).filter(
        Invoice.trip_id == trip.id,
        Invoice.organization_id == context.organization_id
    ).first()

    if not invoice:
        # Generate new invoice from trip data
        inv_no = generate_invoice_number(db, context.organization_id)
        subtotal = trip.freight_charges + trip.additional_charges - trip.discount
        tax = trip.tax_amount or 0.0
        total = trip.total_revenue
        paid = trip.amount_paid or 0.0
        balance = max(0.0, total - paid)
        inv_status = "paid" if balance == 0.0 else ("partially_paid" if paid > 0 else "issued")

        invoice = Invoice(
            organization_id=context.organization_id,
            invoice_number=inv_no,
            customer_id=trip.customer_id,
            trip_id=trip.id,
            invoice_date=trip.trip_date,
            due_date=trip.trip_date + timedelta(days=30),
            subtotal=subtotal,
            tax_amount=tax,
            total_amount=total,
            paid_amount=paid,
            balance_amount=balance,
            status=inv_status,
            notes=f"Auto-generated for Trip {trip.trip_number}"
        )
        db.add(invoice)
        db.flush()

        if paid > 0:
            pay_no = generate_payment_number(db, context.organization_id)
            payment = Payment(
                organization_id=context.organization_id,
                invoice_id=invoice.id,
                payment_number=pay_no,
                payment_date=trip.trip_date,
                amount=paid,
                payment_method="bank_transfer",
                reference_number=f"Advance for {trip.trip_number}",
                notes="Advance received during trip booking"
            )
            db.add(payment)

        db.commit()
        db.refresh(invoice)

    # Fetch complete details for invoice template rendering
    customer = trip.customer
    vehicle = trip.vehicle
    driver = trip.driver
    org = context.organization
    payments = db.query(Payment).filter(Payment.invoice_id == invoice.id).all()

    return {
        "invoice": {
            "id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "invoice_date": invoice.invoice_date.isoformat(),
            "due_date": invoice.due_date.isoformat(),
            "subtotal": invoice.subtotal,
            "tax_amount": invoice.tax_amount,
            "total_amount": invoice.total_amount,
            "paid_amount": invoice.paid_amount,
            "balance_amount": invoice.balance_amount,
            "status": invoice.status,
            "notes": invoice.notes
        },
        "organization": {
            "name": org.name if org else "TransportPro Logistics",
            "address": org.address if org else "Transport Nagar",
            "city": org.city if org else "Pune",
            "state": org.state if org else "Maharashtra",
            "phone": org.phone if org else "",
            "email": org.email if org else "",
            "tax_number": org.tax_number if org else "GSTIN-NOT-SET",
            "currency": org.currency if org else "INR"
        },
        "customer": {
            "id": customer.id if customer else "",
            "name": customer.name if customer else "Consignee",
            "contact_person": customer.contact_person if customer else "",
            "phone": customer.phone if customer else "",
            "email": customer.email if customer else "",
            "billing_address": customer.billing_address if customer else "",
            "city": customer.city if customer else "",
            "state": customer.state if customer else "",
            "tax_number": customer.tax_number if customer else ""
        },
        "trip": {
            "id": trip.id,
            "trip_number": trip.trip_number,
            "trip_date": trip.trip_date.isoformat(),
            "customer_po_ref": trip.customer_po_ref or "N/A",
            "pickup_city": trip.pickup_city,
            "pickup_address": trip.pickup_address or "",
            "delivery_city": trip.delivery_city,
            "delivery_address": trip.delivery_address or "",
            "cargo_description": trip.cargo_description or "General Goods",
            "cargo_weight_tonnes": trip.cargo_weight_tonnes or 0.0,
            "vehicle_number": vehicle.vehicle_number if vehicle else "N/A",
            "vehicle_type": vehicle.vehicle_type if vehicle else "N/A",
            "driver_name": driver.name if driver else "N/A",
            "driver_phone": driver.phone if driver else "N/A",
            "freight_charges": trip.freight_charges,
            "additional_charges": trip.additional_charges,
            "discount": trip.discount,
            "tax_amount": trip.tax_amount,
            "total_revenue": trip.total_revenue,
            "amount_paid": trip.amount_paid or 0.0,
            "due_amount": trip.due_amount if trip.due_amount is not None else max(0.0, trip.total_revenue - (trip.amount_paid or 0.0))
        },
        "payments": [
            {
                "id": p.id,
                "payment_number": p.payment_number,
                "payment_date": p.payment_date.isoformat(),
                "amount": p.amount,
                "payment_method": p.payment_method,
                "reference_number": p.reference_number
            } for p in payments
        ]
    }

