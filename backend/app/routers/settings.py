from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.setting import Setting
from app.schemas.setting import SettingResponse, SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(db: Session) -> Setting:
    setting = db.get(Setting, 1)
    if setting is None:
        setting = Setting(id=1)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting


@router.get("", response_model=SettingResponse)
def read_settings(db: Session = Depends(get_db)) -> Setting:
    return _get_or_create(db)


@router.patch("", response_model=SettingResponse)
def update_settings(payload: SettingUpdate, db: Session = Depends(get_db)) -> Setting:
    setting = _get_or_create(db)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(setting, key, value)
    db.commit()
    db.refresh(setting)
    return setting
