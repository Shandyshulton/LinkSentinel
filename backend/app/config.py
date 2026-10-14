from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Konfigurasi aplikasi, dibaca dari environment / file .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:@localhost:5433/linksentinel"

    # Daftar origin frontend yang diizinkan CORS, dipisah koma.
    # Contoh produksi: "https://linksentinel.vercel.app,http://localhost:5173"
    frontend_origin: str = "http://localhost:5173"

    @property
    def allowed_origins(self) -> list[str]:
        """Pecah frontend_origin menjadi daftar origin yang sudah dirapikan."""
        return [o.strip() for o in self.frontend_origin.split(",") if o.strip()]


settings = Settings()
