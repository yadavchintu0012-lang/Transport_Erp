from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.entities import User, Organization, OrganizationMembership, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class CurrentContext:
    def __init__(
        self,
        user: User,
        organization: Optional[Organization] = None,
        role: Optional[Role] = None,
        permissions: Optional[Dict[str, list]] = None,
        is_superadmin: bool = False
    ):
        self.user = user
        self.organization = organization
        self.role = role
        self.permissions = permissions or {}
        self.is_superadmin = is_superadmin

    @property
    def organization_id(self) -> Optional[str]:
        return self.organization.id if self.organization else None

def get_current_context(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> CurrentContext:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise credentials_exception

    if user.is_superadmin:
        return CurrentContext(user=user, is_superadmin=True)

    org_id = payload.get("org_id")
    if not org_id:
        # Fetch first active membership if not specified in token
        membership = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.is_active == True
        ).first()
    else:
        membership = db.query(OrganizationMembership).filter(
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.organization_id == org_id,
            OrganizationMembership.is_active == True
        ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organization workspace found for this user."
        )

    organization = db.query(Organization).filter(Organization.id == membership.organization_id).first()
    if not organization or not organization.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company workspace is deactivated or suspended."
        )

    role = db.query(Role).filter(Role.id == membership.role_id).first()
    permissions = role.permissions if (role and role.permissions) else {}

    return CurrentContext(
        user=user,
        organization=organization,
        role=role,
        permissions=permissions,
        is_superadmin=False
    )

def require_permission(module: str, action: str):
    """
    Dependency factory to check module and action permissions.
    E.g. require_permission('trips', 'create')
    """
    def permission_checker(context: CurrentContext = Depends(get_current_context)):
        if context.is_superadmin:
            return context

        # Company Owner always has full access to their company
        if context.role and context.role.code == "owner":
            return context

        perms_for_module = context.permissions.get(module, [])
        if action not in perms_for_module:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: you do not have permission to {action} in {module}."
            )
        return context
    return permission_checker
