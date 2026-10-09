from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List

from app.core.database import get_db
from app.models.entities import Driver, Trip
from app.schemas.all_schemas import DriverCreateRequest, DriverUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/")
def list_drivers(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("drivers", "view"))
):
    query = db.query(Driver).filter(Driver.organization_id == context.organization_id)
    if status:
        query = query.filter(Driver.status == status)
    if search:
        query = query.filter(
            or_(
                Driver.name.ilike(f"%{search}%"),
                Driver.phone.ilike(f"%{search}%"),
                Driver.license_number.ilike(f"%{search}%")
            )
        )
    drivers = query.order_by(Driver.created_at.desc()).all()
    
    results = []
    for d in drivers:
        trip_count = db.query(Trip).filter(Trip.driver_id == d.id).count()
        results.append({
            "id": d.id,
            "name": d.name,
            "phone": d.phone,
            "email": d.email,
            "license_number": d.license_number,
            "license_expiry": d.license_expiry.isoformat() if d.license_expiry else None,
            "employment_type": d.employment_type,
            "salary_amount": d.salary_amount,
            "status": d.status,
            "total_trips": trip_count,
            "created_at": d.created_at.isoformat() if d.created_at else None
        })
    return results

@router.post("/")
def create_driver(
    data: DriverCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("drivers", "create"))
):
    driver = Driver(
        organization_id=context.organization_id,
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=data.email.strip().lower() if data.email else None,
        license_number=data.license_number.upper().strip(),
        license_expiry=data.license_expiry,
        employment_type=data.employment_type,
        salary_amount=data.salary_amount or 0.0,
        status="available"
    )
    db.add(driver)
    db.commit()
    db.refresh(driver)
    log_audit(db, "driver_create", context.organization_id, context.user.id, "Driver", driver.id, {"name": driver.name})
    return driver

@router.put("/{driver_id}")
def update_driver(
    driver_id: str,
    data: DriverUpdateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("drivers", "edit"))
):
    d = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.organization_id == context.organization_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found.")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(d, field, val)

    db.commit()
    log_audit(db, "driver_update", context.organization_id, context.user.id, "Driver", d.id)
    return {"message": "Driver updated successfully"}

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("drivers", "delete"))
):
    d = db.query(Driver).filter(
        Driver.id == driver_id,
        Driver.organization_id == context.organization_id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="Driver not found.")
    
    trips_count = db.query(Trip).filter(Trip.driver_id == driver_id).count()
    if trips_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete driver with recorded trips. Set status to inactive instead.")

    db.delete(d)
    db.commit()
    log_audit(db, "driver_delete", context.organization_id, context.user.id, "Driver", driver_id)
    return {"message": "Driver deleted successfully"}
