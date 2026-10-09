from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import SubscriptionPlan, Subscription, Organization
from app.core.dependencies import get_current_context, CurrentContext

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("/plans")
def get_plans(db: Session = Depends(get_db)):
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()
    return plans

@router.get("/my-plan")
def get_current_subscription(
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(get_current_context)
):
    sub = db.query(Subscription).filter(
        Subscription.organization_id == context.organization_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found.")
    
    return {
        "status": sub.status,
        "billing_cycle": sub.billing_cycle,
        "start_date": sub.start_date.isoformat() if sub.start_date else None,
        "expiry_date": sub.expiry_date.isoformat() if sub.expiry_date else None,
        "plan": {
            "name": sub.plan.name,
            "code": sub.plan.code,
            "price_monthly": sub.plan.price_monthly,
            "price_yearly": sub.plan.price_yearly,
            "max_vehicles": sub.plan.max_vehicles,
            "max_staff": sub.plan.max_staff,
            "max_trips_monthly": sub.plan.max_trips_monthly,
            "features": sub.plan.features
        } if sub.plan else None
    }
