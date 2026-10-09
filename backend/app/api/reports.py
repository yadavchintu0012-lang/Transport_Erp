from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import csv
import io

from app.core.database import get_db
from app.models.entities import Trip, Vehicle, Driver, Customer, Expense, Invoice
from app.core.dependencies import get_current_context, CurrentContext, require_permission

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/trips-csv")
def export_trips_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("reports", "export"))
):
    query = db.query(Trip).filter(Trip.organization_id == context.organization_id)
    if start_date:
        query = query.filter(Trip.trip_date >= start_date)
    if end_date:
        query = query.filter(Trip.trip_date <= end_date)
    if status:
        query = query.filter(Trip.status == status)

    trips = query.order_by(Trip.trip_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Trip ID", "Date", "Customer", "Vehicle", "Driver",
        "From", "To", "Cargo", "Status", "Freight Revenue", "Amount Paid", "Due Amount", "Direct Expenses", "Trip Profit"
    ])

    for t in trips:
        writer.writerow([
            t.trip_number,
            t.trip_date.strftime("%Y-%m-%d") if t.trip_date else "",
            t.customer.name if t.customer else "",
            t.vehicle.vehicle_number if t.vehicle else "",
            t.driver.name if t.driver else "",
            t.pickup_city,
            t.delivery_city,
            t.cargo_description or "",
            t.status,
            t.total_revenue,
            t.amount_paid or 0.0,
            t.due_amount if t.due_amount is not None else (t.total_revenue - (t.amount_paid or 0.0)),
            t.total_expenses,
            t.trip_profit
        ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=trips-report-{datetime.now().strftime('%Y%m%d')}.csv"}
    )

@router.get("/profit-loss")
def get_profit_loss_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("reports", "view_profit"))
):
    org_id = context.organization_id
    trip_q = db.query(Trip).filter(Trip.organization_id == org_id)
    exp_q = db.query(Expense).filter(Expense.organization_id == org_id)

    if start_date:
        trip_q = trip_q.filter(Trip.trip_date >= start_date)
        exp_q = exp_q.filter(Expense.expense_date >= start_date)
    if end_date:
        trip_q = trip_q.filter(Trip.trip_date <= end_date)
        exp_q = exp_q.filter(Expense.expense_date <= end_date)

    trips = trip_q.all()
    expenses = exp_q.all()

    gross_freight = sum(t.freight_charges + t.additional_charges - t.discount for t in trips)
    tax_collected = sum(t.tax_amount for t in trips)
    net_operating_revenue = gross_freight

    diesel_total = sum(t.diesel_expense for t in trips)
    toll_total = sum(t.toll_expense for t in trips)
    allowance_total = sum(t.driver_allowance for t in trips)
    loading_total = sum(t.loading_unloading_expense for t in trips)
    other_direct_total = sum(t.other_direct_expense for t in trips)
    total_direct_costs = diesel_total + toll_total + allowance_total + loading_total + other_direct_total

    gross_contribution = net_operating_revenue - total_direct_costs

    # Overheads
    overheads = [e for e in expenses if not e.is_trip_direct]
    total_overheads = sum(e.amount for e in overheads)
    operating_profit = gross_contribution - total_overheads

    return {
        "revenue": {
            "gross_freight": round(gross_freight, 2),
            "tax_collected": round(tax_collected, 2),
            "net_operating_revenue": round(net_operating_revenue, 2)
        },
        "direct_costs": {
            "diesel": round(diesel_total, 2),
            "toll": round(toll_total, 2),
            "driver_allowance": round(allowance_total, 2),
            "loading_unloading": round(loading_total, 2),
            "other_direct": round(other_direct_total, 2),
            "total_direct_costs": round(total_direct_costs, 2)
        },
        "gross_contribution": round(gross_contribution, 2),
        "overheads": {
            "total_overheads": round(total_overheads, 2)
        },
        "operating_profit": round(operating_profit, 2)
    }
