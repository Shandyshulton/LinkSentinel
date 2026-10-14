"""Mesin deteksi phishing berbasis heuristik.

Pendekatan rule-based: setiap aturan menambah bobot risiko dan satu alasan
yang dapat dibaca manusia (Bahasa Indonesia). Total bobot dipetakan menjadi
tiga tingkat risiko sesuai desain: rendah (1), mencurigakan (2), tinggi (3).

Dirancang modular: untuk menambah sumber eksternal (mis. Google Safe Browsing
atau VirusTotal), tambahkan aturan baru di `_RULES` atau panggil API di
`analyze` dan gabungkan bobotnya.
"""

from __future__ import annotations

import ipaddress
import re
from dataclasses import dataclass
from urllib.parse import urlparse

# Ambang pemetaan bobot -> tingkat risiko
_SUSPICIOUS_THRESHOLD = 3
_HIGH_THRESHOLD = 6

# Daftar domain tepercaya (allowlist sederhana) -> mengurangi risiko
_TRUSTED_DOMAINS = {
    "wikipedia.org",
    "google.com",
    "github.com",
    "microsoft.com",
    "apple.com",
    "mozilla.org",
}

# Pola domain yang kuat terindikasi phishing (daftar hitam lokal).
# Pola ini meniru halaman kredensial/verifikasi akun resmi.
_PHISHING_BLACKLIST = [
    "verifikasi-akun",
    "login-aman",
    "akun-terblokir",
    "secure-login",
    "verify-account",
]

# Pola yang mencurigakan namun belum tentu phishing kuat (mis. promosi/hadiah).
_SUSPICIOUS_PATTERNS = [
    "promo-hadiah",
    "hadiah-gratis",
    "promo",
    "giveaway",
    "bonus-besar",
]

# Kata kunci kredensial/verifikasi akun yang khas phishing peniru halaman masuk.
_CREDENTIAL_KEYWORDS = [
    "verifikasi",
    "verify",
    "login",
    "signin",
    "secure",
    "account",
    "akun",
    "update",
    "confirm",
    "banking",
    "wallet",
    "password",
    "sandi",
]

# TLD yang relatif lebih berisiko (contoh umum)
_RISKY_TLDS = {".zip", ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".click"}

# Layanan URL shortener
_SHORTENERS = {"bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "cutt.ly"}


@dataclass
class DetectionResult:
    risk_level: str  # "low" | "suspicious" | "high"
    risk_score: int  # 1 | 2 | 3
    reasons: list[str]


class InvalidUrlError(ValueError):
    """Diangkat ketika URL tidak dapat diurai/divalidasi."""


def _registrable_domain(host: str) -> str:
    """Ambil domain level teratas yang dapat didaftarkan (perkiraan sederhana)."""
    parts = host.split(".")
    if len(parts) >= 2:
        return ".".join(parts[-2:])
    return host


def normalize_and_validate(raw_url: str) -> tuple[str, str]:
    """Validasi URL dan kembalikan (url_ternormalisasi, host).

    Mengangkat InvalidUrlError bila skema bukan http/https atau host kosong.
    """
    url = raw_url.strip()
    if not url:
        raise InvalidUrlError("URL kosong.")

    # Jangan terima spasi di tengah (bukan URL tunggal yang valid).
    if any(c.isspace() for c in url):
        raise InvalidUrlError("URL tidak boleh mengandung spasi.")

    if "://" in url:
        # Pengguna menyertakan skema. Hanya http/https yang didukung.
        scheme = url.split("://", 1)[0].lower()
        if scheme not in ("http", "https"):
            raise InvalidUrlError(
                "Hanya tautan http:// atau https:// yang dapat diperiksa."
            )
    else:
        # Tanpa skema: anggap https:// agar pengguna tak perlu mengetiknya.
        # Aman karena kita hanya menganalisis pola, bukan membuka situs.
        url = f"https://{url}"

    parsed = urlparse(url)
    if not parsed.netloc:
        raise InvalidUrlError("Alamat domain tidak ditemukan pada URL.")

    host = parsed.hostname or ""
    if not host:
        raise InvalidUrlError("Nama domain tidak valid.")

    # Host minimal harus punya satu titik (mis. "contoh.com"), kecuali localhost.
    if "." not in host and host != "localhost":
        raise InvalidUrlError("Nama domain tidak valid.")

    return url, host.lower()


def analyze(raw_url: str) -> DetectionResult:
    """Analisis sebuah URL dan hasilkan penilaian risiko heuristik."""
    url, host = normalize_and_validate(raw_url)
    parsed = urlparse(url)

    weight = 0
    reasons: list[str] = []
    positive_notes: list[str] = []

    registrable = _registrable_domain(host)

    # 1. Allowlist domain tepercaya
    is_trusted = registrable in _TRUSTED_DOMAINS
    if is_trusted:
        positive_notes.append(
            "Domain dikenal dan tidak terdeteksi dalam daftar phishing yang diperiksa."
        )

    # 2a. Daftar hitam phishing kuat
    for pattern in _PHISHING_BLACKLIST:
        if pattern in host:
            weight += 4
            reasons.append(
                "Domain terdeteksi dalam daftar phishing yang diperiksa."
            )
            break

    # 2b. Pola mencurigakan (promosi/hadiah): bobot sedang
    matched_promo = False
    for pattern in _SUSPICIOUS_PATTERNS:
        if pattern in host:
            matched_promo = True
            weight += 3
            reasons.append(
                "Domain bernuansa promosi hadiah dan mengarah ke halaman klaim."
            )
            reasons.append("Reputasi domain masih terbatas.")
            break

    # 3. Penggunaan alamat IP sebagai host
    try:
        ipaddress.ip_address(host)
        weight += 3
        reasons.append("Alamat menggunakan IP langsung, bukan nama domain resmi.")
    except ValueError:
        pass

    # 4. Pola verifikasi/login pada domain atau path
    full = (host + parsed.path).lower()
    matched_keywords = [kw for kw in _CREDENTIAL_KEYWORDS if kw in full]
    if not is_trusted and not matched_promo and matched_keywords:
        weight += 2
        reasons.append(
            "Alamat menggunakan pola verifikasi akun untuk mengarahkan ke halaman masuk."
        )

    # 5. Subdomain berlebihan (teknik penyamaran)
    if host.count(".") >= 3:
        weight += 2
        reasons.append("Struktur subdomain berlapis yang menyamarkan domain asli.")

    # 6. Tanda hubung berlebihan pada domain
    if registrable.count("-") >= 2:
        weight += 1
        reasons.append("Nama domain memakai banyak tanda hubung, pola umum phishing.")

    # 7. TLD berisiko
    for tld in _RISKY_TLDS:
        if host.endswith(tld):
            weight += 2
            reasons.append(f"Domain memakai ekstensi berisiko ({tld}).")
            break

    # 8. URL shortener
    if registrable in _SHORTENERS:
        weight += 3
        reasons.append("Tautan dipendekkan sehingga tujuan asli tersembunyi.")

    # 9. Tanpa HTTPS
    if parsed.scheme != "https":
        weight += 1
        reasons.append("Koneksi tidak memakai HTTPS.")
    else:
        positive_notes.append(
            "Koneksi menggunakan HTTPS; ini bukan jaminan keamanan."
        )

    # 10. Karakter mencurigakan ('@' pada URL, angka pengganti huruf)
    if "@" in url:
        weight += 3
        reasons.append("URL mengandung karakter '@' yang dapat menyembunyikan tujuan.")

    # Petakan bobot -> tingkat risiko
    if weight >= _HIGH_THRESHOLD:
        level, score = "high", 3
    elif weight >= _SUSPICIOUS_THRESHOLD:
        level, score = "suspicious", 2
    else:
        level, score = "low", 1

    # Lengkapi alasan agar informatif pada tiap tingkat
    if level == "low":
        if not reasons:
            reasons.append(
                "Tidak ditemukan pola alamat yang meniru layanan lain."
            )
        reasons = positive_notes + reasons
    elif level == "suspicious":
        reasons.append(
            "Tidak ada kecocokan pasti pada daftar phishing yang diperiksa."
        )
    else:  # high
        if not any("tidak cocok" in r for r in reasons):
            reasons.append(
                "Domain tidak cocok dengan alamat resmi layanan yang ditiru."
            )

    return DetectionResult(risk_level=level, risk_score=score, reasons=reasons)
