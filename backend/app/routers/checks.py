import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_owner_id
from app.models.check import Check
from app.models.setting import Setting
from app.schemas.check import CheckRequest, CheckResponse
from app.services import detector
from app.services.detector import InvalidUrlError

router = APIRouter(prefix="/api/checks", tags=["checks"])


def _to_response(check: Check) -> CheckResponse:
    reasons = json.loads(check.reasons) if check.reasons else []
    return CheckResponse(
        id=check.id,
        url=check.url,
        domain=check.domain,
        status=check.status,
        risk_level=check.risk_level,
        risk_score=check.risk_score,
        reasons=reasons,
        error_message=check.error_message,
        created_at=check.created_at,
    )


def _get_settings(db: Session) -> Setting:
    setting = db.get(Setting, 1)
    if setting is None:
        setting = Setting(id=1)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


@router.post("", response_model=CheckResponse, status_code=status.HTTP_201_CREATED)
def create_check(
    payload: CheckRequest,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_owner_id),
) -> CheckResponse:
    """Periksa sebuah URL dan (opsional) simpan hasilnya ke riwayat."""
    try:
        _, host = detector.normalize_and_validate(payload.url)
    except InvalidUrlError as exc:
        # 422 -> frontend menampilkan layar "URL tidak valid"
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    result = detector.analyze(payload.url)
    settings_row = _get_settings(db)

    check = Check(
        owner_id=owner_id,
        url=payload.url.strip(),
        domain=host,
        status="completed",
        risk_level=result.risk_level,
        risk_score=result.risk_score,
        reasons=json.dumps(result.reasons, ensure_ascii=False),
        error_message=None,
    )

    # Hormati preferensi "Simpan riwayat"
    if settings_row.save_history:
        db.add(check)
        db.commit()
        db.refresh(check)
    else:
        # Tetap kembalikan hasil tanpa persistensi; beri id sementara 0
        check.id = 0
        check.created_at = datetime.now(timezone.utc)

    return _to_response(check)


@router.get("", response_model=list[CheckResponse])
def list_checks(
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_owner_id),
    risk_level: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
) -> list[CheckResponse]:
    """Daftar riwayat pemeriksaan milik pemilik (device) ini, dengan filter opsional."""
    stmt = (
        select(Check)
        .where(Check.owner_id == owner_id)
        .order_by(Check.created_at.desc())
    )

    if risk_level:
        stmt = stmt.where(Check.risk_level == risk_level)
    if status_filter:
        stmt = stmt.where(Check.status == status_filter)
    if q:
        like = f"%{q.lower()}%"
        stmt = stmt.where(Check.url.ilike(like))

    stmt = stmt.limit(limit)
    rows = db.execute(stmt).scalars().all()
    return [_to_response(r) for r in rows]


@router.get("/{check_id}", response_model=CheckResponse)
def get_check(
    check_id: int,
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_owner_id),
) -> CheckResponse:
    # Batasi ke pemilik: record milik device lain tetap dianggap "tidak ditemukan".
    check = db.execute(
        select(Check).where(Check.id == check_id, Check.owner_id == owner_id)
    ).scalar_one_or_none()
    if check is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hasil tidak ditemukan.")
    return _to_response(check)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_history(
    db: Session = Depends(get_db),
    owner_id: str = Depends(get_owner_id),
) -> None:
    """Hapus riwayat pemeriksaan milik pemilik (device) ini saja."""
    db.query(Check).filter(Check.owner_id == owner_id).delete()
    db.commit()
