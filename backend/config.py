from __future__ import annotations
import os
from functools import lru_cache


class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    model_cache_dir: str = os.getenv("MODEL_CACHE_DIR", "/tmp/webforge_models")
    log_level: str = os.getenv("LOG_LEVEL", "info")

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
