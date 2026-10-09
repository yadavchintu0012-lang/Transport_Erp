from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.entities import User, OrganizationMembership, Role
from app.schemas.all_schemas import StaffCreateRequest, StaffUpdateRequest, RoleCreateRequest, RoleUpdateRequest
from app.core.dependencies import get_current_context, CurrentContext, require_permission
from app.services.audit import log_audit

router = APIRouter(prefix="/staff", tags=["Staff & RBAC"])

@router.get("/")
def list_staff(
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("staff", "view"))
):
    memberships = db.query(OrganizationMembership).filter(
        OrganizationMembership.organization_id == context.organization_id
    ).all()

    results = []
    for m in memberships:
        u = m.user
        r = m.role
        results.append({
            "membership_id": m.id,
            "user_id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "is_active": m.is_active and u.is_active,
            "role": {
                "id": r.id,
                "name": r.name,
                "code": r.code
            } if r else None,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
            "joined_at": m.joined_at.isoformat() if m.joined_at else None
        })
    return results

@router.post("/")
def create_staff(
    data: StaffCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("staff", "create"))
):
    # Verify role belongs to this org or is system role
    role = db.query(Role).filter(
        Role.id == data.role_id,
        (Role.organization_id == context.organization_id) | (Role.organization_id == None)
    ).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role specified.")

    # Check if user already exists
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if user:
        # Check if already member of this org
        existing_m = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.organization_id == context.organization_id
        ).first()
        if existing_m:
            raise HTTPException(status_code=400, detail="User is already a member of this company.")
    else:
        user = User(
            email=data.email.lower(),
            hashed_password=get_password_hash(data.password),
            full_name=data.full_name,
            phone=data.phone
        )
        db.add(user)
        db.flush()

    membership = OrganizationMembership(
        organization_id=context.organization_id,
        user_id=user.id,
        role_id=role.id
    )
    db.add(membership)
    db.commit()

    log_audit(db, "staff_create", context.organization_id, context.user.id, "User", user.id, {"role": role.name})
    return {"message": "Staff member created successfully", "user_id": user.id}

@router.put("/{membership_id}")
def update_staff(
    membership_id: str,
    data: StaffUpdateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("staff", "edit"))
):
    m = db.query(OrganizationMembership).filter(
        OrganizationMembership.id == membership_id,
        OrganizationMembership.organization_id == context.organization_id
    ).first()
    if not m:
        raise HTTPException(status_code=404, detail="Staff record not found.")

    if data.role_id:
        role = db.query(Role).filter(
            Role.id == data.role_id,
            (Role.organization_id == context.organization_id) | (Role.organization_id == None)
        ).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role.")
        m.role_id = role.id

    if data.is_active is not None:
        m.is_active = data.is_active

    if data.full_name:
        m.user.full_name = data.full_name
    if data.phone:
        m.user.phone = data.phone

    db.commit()
    log_audit(db, "staff_update", context.organization_id, context.user.id, "OrganizationMembership", m.id)
    return {"message": "Staff member updated successfully"}

# --- Custom Roles Endpoints ---
@router.get("/roles")
def list_roles(
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("staff", "view"))
):
    roles = db.query(Role).filter(
        (Role.organization_id == context.organization_id) | (Role.organization_id == None)
    ).all()
    return roles

@router.post("/roles")
def create_custom_role(
    data: RoleCreateRequest,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("staff", "manage_users"))
):
    import re
    code = re.sub(r'[\W_]+', '_', data.name.lower()).strip('_')
    role = Role(
        organization_id=context.organization_id,
        name=data.name,
        code=code,
        description=data.description,
        is_system=False,
        permissions=data.permissions
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    log_audit(db, "role_create", context.organization_id, context.user.id, "Role", role.id, {"name": role.name})
    return role
