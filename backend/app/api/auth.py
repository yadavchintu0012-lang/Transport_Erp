from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import re

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.rbac import SYSTEM_ROLES
from app.models.entities import (
    User, Organization, OrganizationMembership, Role,
    SubscriptionPlan, Subscription
)
from app.schemas.all_schemas import LoginRequest, RegisterCompanyRequest, Token
from app.core.dependencies import get_current_context, CurrentContext
from app.services.audit import log_audit

router = APIRouter(prefix="/auth", tags=["Authentication"])

def slugify(text: str) -> str:
    text = text.lower()
    return re.sub(r'[\W_]+', '-', text).strip('-')

@router.post("/register", response_model=Token)
def register_company(data: RegisterCompanyRequest, db: Session = Depends(get_db)):
    # 1. Check if user email already exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 2. Generate slug and ensure uniqueness
    base_slug = slugify(data.company_name)
    slug = base_slug
    counter = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # 3. Create Organization
    org = Organization(
        name=data.company_name,
        slug=slug,
        address=data.address,
        city=data.city,
        state=data.state,
        phone=data.phone,
        email=data.email.lower(),
        tax_number=data.tax_number,
        is_demo=False
    )
    db.add(org)
    db.flush()

    # 4. Create User
    user = User(
        email=data.email.lower(),
        hashed_password=get_password_hash(data.password),
        full_name=data.owner_name,
        phone=data.phone,
        is_superadmin=False
    )
    db.add(user)
    db.flush()

    # 5. Seed System Roles for this Organization
    owner_role = None
    for code, role_info in SYSTEM_ROLES.items():
        role_obj = Role(
            organization_id=org.id,
            name=role_info["name"],
            code=role_info["code"],
            description=role_info["description"],
            is_system=True,
            permissions=role_info["permissions"]
        )
        db.add(role_obj)
        db.flush()
        if code == "owner":
            owner_role = role_obj

    # 6. Assign Owner Role to the registering user
    membership = OrganizationMembership(
        organization_id=org.id,
        user_id=user.id,
        role_id=owner_role.id
    )
    db.add(membership)

    # 7. Assign Subscription Plan
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == data.plan_code).first()
    if not plan:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.code == "professional").first()
    
    if plan:
        sub = Subscription(
            organization_id=org.id,
            plan_id=plan.id,
            status="active"
        )
        db.add(sub)

    db.commit()

    log_audit(db, "register_company", org.id, user.id, "Organization", org.id, {"company_name": org.name})

    # 8. Create JWT Token
    token_payload = {
        "sub": user.id,
        "org_id": org.id,
        "role": "owner"
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_superadmin": False
        },
        "organization": {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "tax_number": org.tax_number,
            "currency": org.currency
        },
        "role": {
            "id": owner_role.id,
            "name": owner_role.name,
            "code": owner_role.code
        },
        "permissions": owner_role.permissions
    }

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # If Superadmin
    if user.is_superadmin:
        token = create_access_token({"sub": user.id, "is_superadmin": True})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_superadmin": True
            },
            "organization": None,
            "role": {"id": "superadmin", "name": "Platform Super Admin", "code": "superadmin"},
            "permissions": {"all": ["*"]}
        }

    # Fetch user's active membership
    membership = db.query(OrganizationMembership).filter(
        OrganizationMembership.user_id == user.id,
        OrganizationMembership.is_active == True
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organization found for this account."
        )

    org = db.query(Organization).filter(Organization.id == membership.organization_id).first()
    if not org or not org.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization account is suspended or inactive."
        )

    role = db.query(Role).filter(Role.id == membership.role_id).first()

    token_payload = {
        "sub": user.id,
        "org_id": org.id,
        "role": role.code if role else "viewer"
    }
    token = create_access_token(token_payload)

    log_audit(db, "login", org.id, user.id, "User", user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_superadmin": False
        },
        "organization": {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "tax_number": org.tax_number,
            "currency": org.currency,
            "is_demo": org.is_demo
        },
        "role": {
            "id": role.id if role else "",
            "name": role.name if role else "User",
            "code": role.code if role else "user"
        },
        "permissions": role.permissions if role else {}
    }

@router.get("/me")
def get_me(context: CurrentContext = Depends(get_current_context)):
    return {
        "user": {
            "id": context.user.id,
            "email": context.user.email,
            "full_name": context.user.full_name,
            "phone": context.user.phone,
            "is_superadmin": context.is_superadmin
        },
        "organization": {
            "id": context.organization.id,
            "name": context.organization.name,
            "slug": context.organization.slug,
            "tax_number": context.organization.tax_number,
            "currency": context.organization.currency,
            "address": context.organization.address,
            "city": context.organization.city,
            "state": context.organization.state,
            "phone": context.organization.phone,
            "email": context.organization.email,
            "is_demo": context.organization.is_demo
        } if context.organization else None,
        "role": {
            "id": context.role.id,
            "name": context.role.name,
            "code": context.role.code
        } if context.role else None,
        "permissions": context.permissions
    }
