from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AuditLog
from app.core.dependencies import get_current_context, CurrentContext, require_permission

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/")
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    context: CurrentContext = Depends(require_permission("settings", "view"))
):
    query = db.query(AuditLog)
    if not context.is_superadmin:
        query = query.filter(AuditLog.organization_id == context.organization_id)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        u = l.user
        results.append({
            "id": l.id,
            "action": l.action,
            "entity_name": l.entity_name,
            "entity_id": l.entity_id,
            "user_name": u.full_name if u else "System",
            "details": l.details,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return results
