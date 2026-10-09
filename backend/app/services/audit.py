from sqlalchemy.orm import Session
from app.models.entities import AuditLog
from typing import Optional, Dict, Any

def log_audit(
    db: Session,
    action: str,
    organization_id: Optional[str] = None,
    user_id: Optional[str] = None,
    entity_name: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    try:
        log_entry = AuditLog(
            action=action,
            organization_id=organization_id,
            user_id=user_id,
            entity_name=entity_name,
            entity_id=entity_id,
            details=details or {},
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        # Don't fail the main transaction if audit logging encounters an issue
        db.rollback()
        print(f'Error writing audit log: {e}')
