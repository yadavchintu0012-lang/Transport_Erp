from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.entities import Expense, Trip, Vehicle, Driver
from app.schemas.all_schemas import ExpenseCreateRequest, ExpenseUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/expenses", tags=["Expenses"])

def generate_expense_number(db: Session, org_id: str) -> str:
    count = db.query(Expense).filter(Expense.organization_id == org_id).count() + 1
    return f"EXP-{datetime.now().year}-{count:04d}"

@router.get("/")
def list_expenses(
    category: Optional[str] = None,
    is_trip_direct: Optional[bool] = None,
    payment_status: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("expenses", "view"))
):
    query = db.query(Expense).filter(Expense.organization_id == context.organization_id)
    if category:
        query = query.filter(Expense.category == category)
    if is_trip_direct is not None:
        query = query.filter(Expense.is_trip_direct == is_trip_direct)
    if payment_status:
        query = query.filter(Expense.payment_status == payment_status)
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Expense.driver_id == driver_id)
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    expenses = query.order_by(Expense.expense_date.desc()).all()

    results = []
    for exp in expenses:
        results.append({
            "id": exp.id,
            "expense_number": exp.expense_number,
            "expense_date": exp.expense_date.isoformat(),
            "category": exp.category,
            "amount": exp.amount,
            "tax_amount": exp.tax_amount,
            "is_trip_direct": exp.is_trip_direct,
            "trip_id": exp.trip_id,
            "vehicle": {"id": exp.vehicle.id, "vehicle_number": exp.vehicle.vehicle_number} if exp.vehicle else None,
            "driver": {"id": exp.driver.id, "name": exp.driver.name} if exp.driver else None,
            "vendor_name": exp.vendor_name,
            "payment_method": exp.payment_method,
            "payment_status": exp.payment_status,
            "is_approved": exp.is_approved,
            "notes": exp.notes
        })
    return results

@router.post("/")
def create_expense(
    data: ExpenseCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("expenses", "create"))
):
    exp_no = generate_expense_number(db, context.organization_id)
    exp = Expense(
        organization_id=context.organization_id,
        expense_number=exp_no,
        expense_date=data.expense_date,
        category=data.category,
        amount=data.amount,
        tax_amount=data.tax_amount or 0.0,
        is_trip_direct=data.is_trip_direct,
        trip_id=data.trip_id,
        vehicle_id=data.vehicle_id,
        driver_id=data.driver_id,
        vendor_name=data.vendor_name,
        payment_method=data.payment_method or "cash",
        payment_status=data.payment_status or "paid",
        notes=data.notes,
        is_approved=True,
        created_by_user_id=context.user.id
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    log_audit(db, "expense_create", context.organization_id, context.user.id, "Expense", exp.id, {"amount": exp.amount, "category": exp.category})
    return exp

@router.put("/{expense_id}/approve")
def approve_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("expenses", "approve"))
):
    exp = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.organization_id == context.organization_id
    ).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expense record not found.")

    exp.is_approved = True
    db.commit()
    log_audit(db, "expense_approve", context.organization_id, context.user.id, "Expense", exp.id)
    return {"message": "Expense approved successfully"}
