from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CheckRequest(BaseModel):
    """Body permintaan untuk memeriksa sebuah URL."""

    url: str = Field(..., min_length=1, max_length=2048, examples=["https://contoh.com"])


class CheckResponse(BaseModel):
    """Representasi satu hasil pemeriksaan."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    domain: str
    status: str
    risk_level: str | None
    risk_score: int | None
    reasons: list[str]
    error_message: str | None
    created_at: datetime


class StatsRiskBucket(BaseModel):
    level: str
    count: int
    percentage: int


class StatsResponse(BaseModel):
    """Ringkasan untuk layar Statistik."""

    total_attempts: int
    results_available: int
    failed_count: int
    buckets: list[StatsRiskBucket]
