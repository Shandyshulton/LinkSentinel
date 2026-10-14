from pydantic import BaseModel, ConfigDict


class SettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    save_history: bool
    risk_warnings: bool
    reminder_notifications: bool


class SettingUpdate(BaseModel):
    save_history: bool | None = None
    risk_warnings: bool | None = None
    reminder_notifications: bool | None = None
