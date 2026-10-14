"""Dependency bersama untuk router."""

import re

from fastapi import Header, HTTPException, status

# Device ID adalah UUID v4 dari frontend. Validasi format agar hanya menerima
# nilai yang masuk akal (mencegah nilai sampah / terlalu panjang).
_DEVICE_ID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-"
    r"[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def get_owner_id(x_device_id: str | None = Header(default=None)) -> str:
    """Ambil ID perangkat anonim dari header X-Device-Id.

    Ini bukan autentikasi — hanya pemisah riwayat antar pengguna. Tidak pernah
    dicatat ke log. Menolak permintaan tanpa header yang valid.
    """
    if not x_device_id or not _DEVICE_ID_RE.match(x_device_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Header perangkat tidak valid.",
        )
    return x_device_id
