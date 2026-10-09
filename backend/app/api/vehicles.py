from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.entities import Vehicle, Trip
from app.schemas.all_schemas import VehicleCreateRequest, VehicleUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("/")
def list_vehicles(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("vehicles", "view"))
):
    query = db.query(Vehicle).filter(Vehicle.organization_id == context.organization_id)
    if status:
        query = query.filter(Vehicle.status == status)
    if search:
        query = query.filter(
            or_(
                Vehicle.vehicle_number.ilike(f"%{search}%"),
                Vehicle.model.ilike(f"%{search}%"),
                Vehicle.vehicle_type.ilike(f"%{search}%")
            )
        )
    vehicles = query.order_by(Vehicle.created_at.desc()).all()
    
    results = []
    for v in vehicles:
        driver = v.assigned_driver
        # Check active trips count
        trip_count = db.query(Trip).filter(Trip.vehicle_id == v.id).count()
        results.append({
            "id": v.id,
            "vehicle_number": v.vehicle_number,
            "vehicle_type": v.vehicle_type,
            "model": v.model,
            "capacity_tonnage": v.capacity_tonnage,
            "ownership_type": v.ownership_type,
            "status": v.status,
            "assigned_driver": {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone
            } if driver else None,
            "insurance_expiry": v.insurance_expiry.isoformat() if v.insurance_expiry else None,
            "fitness_expiry": v.fitness_expiry.isoformat() if v.fitness_expiry else None,
            "permit_expiry": v.permit_expiry.isoformat() if v.permit_expiry else None,
            "pollution_expiry": v.pollution_expiry.isoformat() if v.pollution_expiry else None,
            "total_trips": trip_count,
            "created_at": v.created_at.isoformat() if v.created_at else None
        })
    return results

@router.post("/")
def create_vehicle(
    data: VehicleCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("vehicles", "create"))
):
    # Check duplicate vehicle number within org
    existing = db.query(Vehicle).filter(
        Vehicle.organization_id == context.organization_id,
        Vehicle.vehicle_number.ilike(data.vehicle_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists.")

    vehicle = Vehicle(
        organization_id=context.organization_id,
        vehicle_number=data.vehicle_number.upper().strip(),
        vehicle_type=data.vehicle_type,
        model=data.model,
        capacity_tonnage=data.capacity_tonnage,
        ownership_type=data.ownership_type,
        assigned_driver_id=data.assigned_driver_id,
        insurance_expiry=data.insurance_expiry,
        fitness_expiry=data.fitness_expiry,
        permit_expiry=data.permit_expiry,
        pollution_expiry=data.pollution_expiry,
        status="available"
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    log_audit(db, "vehicle_create", context.organization_id, context.user.id, "Vehicle", vehicle.id, {"number": vehicle.vehicle_number})
    return vehicle

@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("vehicles", "view"))
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.organization_id == context.organization_id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    return v

@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("vehicles", "edit"))
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.organization_id == context.organization_id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(v, field, val)

    db.commit()
    log_audit(db, "vehicle_update", context.organization_id, context.user.id, "Vehicle", v.id)
    return {"message": "Vehicle updated successfully"}

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("vehicles", "delete"))
):
    v = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id,
        Vehicle.organization_id == context.organization_id
    ).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found.")
    
    # Check if has completed trips
    trips_count = db.query(Trip).filter(Trip.vehicle_id == vehicle_id).count()
    if trips_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete vehicle with historical trip records. Mark as inactive instead.")

    db.delete(v)
    db.commit()
    log_audit(db, "vehicle_delete", context.organization_id, context.user.id, "Vehicle", vehicle_id)
    return {"message": "Vehicle deleted successfully"}
