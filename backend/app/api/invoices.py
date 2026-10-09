from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.entities import Invoice, Payment, Customer, Trip
from app.schemas.all_schemas import InvoiceCreateRequest, PaymentCreateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/invoices", tags=["Invoices & Accounting"])

def generate_invoice_number(db: Session, org_id: str) -> str:
    count = db.query(Invoice).filter(Invoice.organization_id == org_id).count() + 1
    return f"INV-{datetime.now().year}-{count:04d}"

def generate_payment_number(db: Session, org_id: str) -> str:
    count = db.query(Payment).filter(Payment.organization_id == org_id).count() + 1
    return f"PAY-{datetime.now().year}-{count:04d}"

@router.get("/")
def list_invoices(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("accounts", "view"))
):
    query = db.query(Invoice).filter(Invoice.organization_id == context.organization_id)
    if customer_id:
        query = query.filter(Invoice.customer_id == customer_id)
    if status:
        query = query.filter(Invoice.status == status)
    if start_date:
        query = query.filter(Invoice.invoice_date >= start_date)
    if end_date:
        query = query.filter(Invoice.invoice_date <= end_date)

    invoices = query.order_by(Invoice.invoice_date.desc()).all()

    results = []
    for inv in invoices:
        cust = inv.customer
        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat(),
            "due_date": inv.due_date.isoformat(),
            "customer": {"id": cust.id, "name": cust.name, "tax_number": cust.tax_number} if cust else None,
            "trip_id": inv.trip_id,
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "balance_amount": inv.balance_amount,
            "status": inv.status,
            "notes": inv.notes
        })
    return results

@router.post("/")
def create_invoice(
    data: InvoiceCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("accounts", "create"))
):
    inv_no = generate_invoice_number(db, context.organization_id)
    total = data.subtotal + (data.tax_amount or 0.0)

    invoice = Invoice(
        organization_id=context.organization_id,
        invoice_number=inv_no,
        customer_id=data.customer_id,
        trip_id=data.trip_id,
        invoice_date=data.invoice_date,
        due_date=data.due_date,
        subtotal=data.subtotal,
        tax_amount=data.tax_amount or 0.0,
        total_amount=total,
        paid_amount=0.0,
        balance_amount=total,
        status="issued",
        notes=data.notes
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    log_audit(db, "invoice_create", context.organization_id, context.user.id, "Invoice", invoice.id, {"invoice_number": invoice.invoice_number, "total": total})
    return invoice

@router.post("/{invoice_id}/payments")
def record_payment(
    invoice_id: str,
    data: PaymentCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("accounts", "create"))
):
    inv = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.organization_id == context.organization_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

    if data.amount > inv.balance_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount ({data.amount}) cannot exceed current outstanding balance ({inv.balance_amount})."
        )

    pay_no = generate_payment_number(db, context.organization_id)
    payment = Payment(
        organization_id=context.organization_id,
        invoice_id=inv.id,
        payment_number=pay_no,
        payment_date=data.payment_date,
        amount=data.amount,
        payment_method=data.payment_method or "bank_transfer",
        reference_number=data.reference_number,
        notes=data.notes
    )
    db.add(payment)

    # Recalculate invoice balances
    inv.paid_amount += data.amount
    inv.balance_amount = max(0.0, inv.total_amount - inv.paid_amount)
    if inv.balance_amount == 0.0:
        inv.status = "paid"
    else:
        inv.status = "partially_paid"

    db.commit()
    log_audit(db, "payment_record", context.organization_id, context.user.id, "Payment", payment.id, {"amount": data.amount, "invoice_number": inv.invoice_number})
    return {"message": "Payment recorded successfully", "balance_amount": inv.balance_amount, "status": inv.status}

@router.get("/{invoice_id}")
def get_invoice_detail(
    invoice_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("accounts", "view"))
):
    inv = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.organization_id == context.organization_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    payments = db.query(Payment).filter(Payment.invoice_id == inv.id).order_by(Payment.payment_date.desc()).all()
    trip = db.query(Trip).filter(Trip.id == inv.trip_id).first() if inv.trip_id else None
    org = context.organization
    vehicle = trip.vehicle if trip else None
    driver = trip.driver if trip else None

    return {
        "invoice": {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat(),
            "due_date": inv.due_date.isoformat(),
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "total_amount": inv.total_amount,
            "paid_amount": inv.paid_amount,
            "balance_amount": inv.balance_amount,
            "status": inv.status,
            "notes": inv.notes
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
            "id": inv.customer.id if inv.customer else "",
            "name": inv.customer.name if inv.customer else "Valued Client",
            "contact_person": inv.customer.contact_person if inv.customer else "",
            "tax_number": inv.customer.tax_number if inv.customer else "",
            "phone": inv.customer.phone if inv.customer else "",
            "email": inv.customer.email if inv.customer else "",
            "billing_address": inv.customer.billing_address if inv.customer else "",
            "city": inv.customer.city if inv.customer else "",
            "state": inv.customer.state if inv.customer else ""
        } if inv.customer else None,
        "trip": {
            "id": trip.id if trip else "",
            "trip_number": trip.trip_number if trip else "N/A",
            "trip_date": trip.trip_date.isoformat() if trip else inv.invoice_date.isoformat(),
            "customer_po_ref": trip.customer_po_ref if trip else "",
            "pickup_city": trip.pickup_city if trip else "Depot",
            "pickup_address": trip.pickup_address if trip else "",
            "delivery_city": trip.delivery_city if trip else "Destination",
            "delivery_address": trip.delivery_address if trip else "",
            "cargo_description": trip.cargo_description if trip else "Transport Services",
            "cargo_weight_tonnes": trip.cargo_weight_tonnes if trip else 0.0,
            "vehicle_number": vehicle.vehicle_number if vehicle else "N/A",
            "vehicle_type": vehicle.vehicle_type if vehicle else "Commercial Goods Carrier",
            "driver_name": driver.name if driver else "N/A",
            "driver_phone": driver.phone if driver else "",
            "freight_charges": trip.freight_charges if trip else inv.subtotal,
            "additional_charges": trip.additional_charges if trip else 0.0,
            "discount": trip.discount if trip else 0.0,
            "tax_amount": inv.tax_amount,
            "total_revenue": inv.total_amount,
            "amount_paid": inv.paid_amount,
            "due_amount": inv.balance_amount
        } if trip else None,
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
