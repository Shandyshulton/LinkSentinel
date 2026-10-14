from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_owner_id
from app.models.check import Check
from app.schemas.check import StatsResponse, StatsRiskBucket

router = APIRouter(prefix="/api/stats", tags=["stats"])

_LEVELS = ["low", "suspicious", "high"]


@router.get("", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_owner_id),
) -> StatsResponse:
    """Ringkasan aktivitas untuk layar Statistik (hanya milik device ini)."""
    total_attempts = db.execute(
        select(func.count()).select_from(Check).where(Check.owner_id == owner_id)
    ).scalar_one()
    failed_count = db.execute(
        select(func.count())
        .select_from(Check)
        .where(Check.owner_id == owner_id, Check.status == "failed")
    ).scalar_one()
    results_available = total_attempts - failed_count

    # Hitung per tingkat risiko
    counts: dict[str, int] = {level: 0 for level in _LEVELS}
    rows = db.execute(
        select(Check.risk_level, func.count())
        .where(Check.owner_id == owner_id, Check.status == "completed")
        .group_by(Check.risk_level)
    ).all()
    for level, count in rows:
        if level in counts:
            counts[level] = count

    buckets: list[StatsRiskBucket] = []
    for level in _LEVELS:
        count = counts[level]
        pct = round((count / results_available) * 100) if results_available else 0
        buckets.append(StatsRiskBucket(level=level, count=count, percentage=pct))

    return StatsResponse(
        total_attempts=total_attempts,
        results_available=results_available,
        failed_count=failed_count,
        buckets=buckets,
    )
