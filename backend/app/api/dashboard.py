from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models.entities import Trip, Vehicle, Driver, Customer, Expense, Invoice
from app.core.dependencies import get_current_context, CurrentContext, require_permission

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("dashboard", "view"))
):
    org_id = context.organization_id

    # Base query filters
    trip_q = db.query(Trip).filter(Trip.organization_id == org_id)
    exp_q = db.query(Expense).filter(Expense.organization_id == org_id)
    inv_q = db.query(Invoice).filter(Invoice.organization_id == org_id)

    if start_date:
        trip_q = trip_q.filter(Trip.trip_date >= start_date)
        exp_q = exp_q.filter(Expense.expense_date >= start_date)
        inv_q = inv_q.filter(Invoice.invoice_date >= start_date)
    if end_date:
        trip_q = trip_q.filter(Trip.trip_date <= end_date)
        exp_q = exp_q.filter(Expense.expense_date <= end_date)
        inv_q = inv_q.filter(Invoice.invoice_date <= end_date)

    trips = trip_q.all()
    expenses = exp_q.all()
    invoices = inv_q.all()

    # KPI counts
    total_trips = len(trips)
    completed_trips = sum(1 for t in trips if t.status in ["completed", "delivered"])
    trips_in_progress = sum(1 for t in trips if t.status in ["dispatched", "in_transit"])

    # Financial access check
    can_view_financials = (
        context.is_superadmin or
        (context.role and context.role.code == "owner") or
        "view_financials" in context.permissions.get("dashboard", [])
    )
    can_view_profit = (
        context.is_superadmin or
        (context.role and context.role.code == "owner") or
        "view_profit" in context.permissions.get("dashboard", [])
    )

    total_freight_revenue = sum(t.total_revenue for t in trips) if can_view_financials else 0.0
    total_amount_paid = sum(t.amount_paid or 0.0 for t in trips) if can_view_financials else 0.0
    total_due_amount = sum((t.due_amount if t.due_amount is not None else max(0.0, t.total_revenue - (t.amount_paid or 0.0))) for t in trips) if can_view_financials else 0.0
    total_tax_collected = sum(t.tax_amount for t in trips) if can_view_financials else 0.0
    direct_trip_expenses = sum(t.total_expenses for t in trips) if can_view_financials else 0.0
    
    # Overheads from expenses not attached to trips
    overhead_expenses = sum(e.amount for e in expenses if not e.is_trip_direct) if can_view_financials else 0.0
    total_all_expenses = (direct_trip_expenses + overhead_expenses) if can_view_financials else 0.0

    # Real Operating Profit = Revenue (excl tax) - Direct Trip Expenses - General Overheads
    operating_profit = (
        (total_freight_revenue - total_tax_collected) - total_all_expenses
    ) if can_view_profit else 0.0

    pending_receivables = sum(inv.balance_amount for inv in invoices) if can_view_financials else 0.0

    # Vehicles stats
    total_vehicles = db.query(Vehicle).filter(Vehicle.organization_id == org_id).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.organization_id == org_id, Vehicle.status == "on_trip").count()
    available_vehicles = db.query(Vehicle).filter(Vehicle.organization_id == org_id, Vehicle.status == "available").count()
    active_drivers = db.query(Driver).filter(Driver.organization_id == org_id, Driver.status.in_(["available", "on_trip"])).count()

    # 1. Expense Breakdown by Category
    category_map = {}
    if can_view_financials:
        # direct expenses by categories
        category_map["Diesel & Fuel"] = sum(t.diesel_expense for t in trips)
        category_map["Toll Charges"] = sum(t.toll_expense for t in trips)
        category_map["Driver Allowance"] = sum(t.driver_allowance for t in trips)
        category_map["Loading / Labour"] = sum(t.loading_unloading_expense for t in trips)
        
        for e in expenses:
            cat_name = e.category.replace("_", " ").title()
            category_map[cat_name] = category_map.get(cat_name, 0.0) + e.amount

    expense_breakdown = [
        {"name": k, "value": round(v, 2)}
        for k, v in category_map.items() if v > 0
    ]

    # 2. Revenue vs Expenses Daily/Entry Timeline
    date_timeline = {}
    for t in trips:
        d_str = t.trip_date.strftime("%Y-%m-%d") if t.trip_date else "Unknown"
        if d_str not in date_timeline:
            date_timeline[d_str] = {"date": d_str, "revenue": 0.0, "expense": 0.0, "trips": 0}
        date_timeline[d_str]["revenue"] += t.total_revenue
        date_timeline[d_str]["expense"] += t.total_expenses
        date_timeline[d_str]["trips"] += 1

    chart_timeline = sorted(list(date_timeline.values()), key=lambda x: x["date"])

    # 3. Monthly Revenue & Profit Trend (Full monthly tracking)
    monthly_map = {}
    # Also fetch all historical trips for the org to provide continuous monthly tracking
    all_org_trips = db.query(Trip).filter(Trip.organization_id == org_id).all()
    all_org_exp = db.query(Expense).filter(Expense.organization_id == org_id).all()

    for t in all_org_trips:
        if t.trip_date:
            m_key = t.trip_date.strftime("%Y-%m")
            m_label = t.trip_date.strftime("%b %Y")
            if m_key not in monthly_map:
                monthly_map[m_key] = {"key": m_key, "month": m_label, "revenue": 0.0, "direct_expense": 0.0, "overheads": 0.0, "trips": 0}
            monthly_map[m_key]["revenue"] += t.total_revenue
            monthly_map[m_key]["direct_expense"] += t.total_expenses
            monthly_map[m_key]["trips"] += 1

    for e in all_org_exp:
        if e.expense_date:
            m_key = e.expense_date.strftime("%Y-%m")
            m_label = e.expense_date.strftime("%b %Y")
            if m_key not in monthly_map:
                monthly_map[m_key] = {"key": m_key, "month": m_label, "revenue": 0.0, "direct_expense": 0.0, "overheads": 0.0, "trips": 0}
            if not e.is_trip_direct:
                monthly_map[m_key]["overheads"] += e.amount

    monthly_revenue_trend = []
    for k in sorted(monthly_map.keys()):
        m_item = monthly_map[k]
        tot_exp = m_item["direct_expense"] + m_item["overheads"]
        net_profit = round(m_item["revenue"] - tot_exp, 2)
        monthly_revenue_trend.append({
            "key": m_item["key"],
            "month": m_item["month"],
            "revenue": round(m_item["revenue"], 2),
            "expenses": round(tot_exp, 2),
            "profit": net_profit,
            "trips": m_item["trips"]
        })

    # Current calendar month revenue & profit
    current_month_key = datetime.now().strftime("%Y-%m")
    current_month_data = monthly_map.get(current_month_key, {"revenue": 0.0, "direct_expense": 0.0, "overheads": 0.0, "trips": 0})
    monthly_revenue = round(current_month_data["revenue"], 2)
    monthly_profit = round(current_month_data["revenue"] - (current_month_data["direct_expense"] + current_month_data["overheads"]), 2)

    # 4. Top Routes by Revenue and Volume
    route_map = {}
    for t in trips:
        r_name = f"{t.pickup_city} -> {t.delivery_city}"
        if r_name not in route_map:
            route_map[r_name] = {"route": r_name, "revenue": 0.0, "trips": 0, "cargo_weight": 0.0}
        route_map[r_name]["revenue"] += t.total_revenue
        route_map[r_name]["trips"] += 1
        route_map[r_name]["cargo_weight"] += (t.cargo_weight_tonnes or 0.0)

    top_routes = sorted(
        [
            {
                "route": v["route"],
                "revenue": round(v["revenue"], 2),
                "trips": v["trips"],
                "cargo_weight": round(v["cargo_weight"], 1)
            }
            for v in route_map.values()
        ],
        key=lambda x: x["revenue"],
        reverse=True
    )[:6]

    # 5. Vehicle Utilization & Revenue Contribution
    veh_contrib = {}
    for t in trips:
        v_num = t.vehicle.vehicle_number if t.vehicle else "Unassigned"
        if v_num not in veh_contrib:
            veh_contrib[v_num] = {"vehicle": v_num, "revenue": 0.0, "trips": 0, "expenses": 0.0}
        veh_contrib[v_num]["revenue"] += t.total_revenue
        veh_contrib[v_num]["trips"] += 1
        veh_contrib[v_num]["expenses"] += t.total_expenses

    vehicle_performance = sorted(
        [
            {
                "vehicle": v["vehicle"],
                "revenue": round(v["revenue"], 2),
                "trips": v["trips"],
                "profit": round(v["revenue"] - v["expenses"], 2)
            }
            for v in veh_contrib.values()
        ],
        key=lambda x: x["revenue"],
        reverse=True
    )[:6]

    # 6. Top Customers by Revenue
    cust_revenue = {}
    for t in trips:
        c_name = t.customer.name if t.customer else "Unknown"
        cust_revenue[c_name] = cust_revenue.get(c_name, 0.0) + t.total_revenue
    
    top_customers = sorted(
        [{"name": k, "revenue": round(v, 2)} for k, v in cust_revenue.items()],
        key=lambda x: x["revenue"],
        reverse=True
    )[:6]

    # 7. Recent Trips Widget
    recent_trips = [
        {
            "id": t.id,
            "trip_number": t.trip_number,
            "trip_date": t.trip_date.strftime("%d %b %Y") if t.trip_date else "",
            "route": f"{t.pickup_city} -> {t.delivery_city}",
            "customer": t.customer.name if t.customer else "",
            "vehicle": t.vehicle.vehicle_number if t.vehicle else "",
            "revenue": t.total_revenue if can_view_financials else None,
            "status": t.status
        }
        for t in sorted(trips, key=lambda x: x.trip_date or datetime.min, reverse=True)[:5]
    ]

    # 8. Expiry Alerts (Vehicles & Drivers)
    now = datetime.now()
    in_30_days = now + timedelta(days=30)
    
    vehicles_all = db.query(Vehicle).filter(Vehicle.organization_id == org_id).all()
    expiry_alerts = []
    for ev in vehicles_all:
        ins = ev.insurance_expiry.replace(tzinfo=None) if (ev.insurance_expiry and hasattr(ev.insurance_expiry, 'replace')) else ev.insurance_expiry
        fit = ev.fitness_expiry.replace(tzinfo=None) if (ev.fitness_expiry and hasattr(ev.fitness_expiry, 'replace')) else ev.fitness_expiry
        if ins and ins <= in_30_days:
            expiry_alerts.append({"type": "Insurance Expiry", "target": ev.vehicle_number, "date": ins.strftime("%d %b %Y")})
        if fit and fit <= in_30_days:
            expiry_alerts.append({"type": "Fitness Expiry", "target": ev.vehicle_number, "date": fit.strftime("%d %b %Y")})

    return {
        "kpis": {
            "total_trips": total_trips,
            "completed_trips": completed_trips,
            "trips_in_progress": trips_in_progress,
            "total_freight_revenue": round(total_freight_revenue, 2),
            "total_amount_paid": round(total_amount_paid, 2),
            "total_due_amount": round(total_due_amount, 2),
            "monthly_revenue": monthly_revenue,
            "monthly_profit": monthly_profit,
            "total_all_expenses": round(total_all_expenses, 2),
            "operating_profit": round(operating_profit, 2),
            "pending_receivables": round(pending_receivables, 2),
            "total_vehicles": total_vehicles,
            "active_vehicles": active_vehicles,
            "available_vehicles": available_vehicles,
            "active_drivers": active_drivers
        },
        "charts": {
            "timeline": chart_timeline[-20:] if len(chart_timeline) > 20 else chart_timeline,
            "monthly_trend": monthly_revenue_trend,
            "expense_breakdown": expense_breakdown,
            "top_routes": top_routes,
            "vehicle_performance": vehicle_performance,
            "top_customers": top_customers
        },
        "widgets": {
            "recent_trips": recent_trips,
            "expiry_alerts": expiry_alerts[:5]
        }
    }
