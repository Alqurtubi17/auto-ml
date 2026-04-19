"""
Model persistence — saves trained sklearn pipelines to disk so they can be
reused across build jobs without retraining (production pattern).
"""
from __future__ import annotations
import os
import joblib
from typing import Any

from config import get_settings

_settings = get_settings()


def _model_path(model_id: str) -> str:
    os.makedirs(_settings.model_cache_dir, exist_ok=True)
    return os.path.join(_settings.model_cache_dir, f"{model_id}.pkl")


def save_model(model_id: str, model: Any) -> str:
    """Persist a trained model. Returns the file path."""
    path = _model_path(model_id)
    joblib.dump(model, path, compress=3)
    return path


def load_model(model_id: str) -> Any | None:
    """Load a previously saved model, or None if not found."""
    path = _model_path(model_id)
    if not os.path.exists(path):
        return None
    return joblib.load(path)


def model_exists(model_id: str) -> bool:
    return os.path.exists(_model_path(model_id))


def model_size_bytes(model_id: str) -> int | None:
    path = _model_path(model_id)
    if not os.path.exists(path):
        return None
    return os.path.getsize(path)


def format_model_size(model_id: str) -> str:
    size = model_size_bytes(model_id)
    if size is None:
        return "unknown"
    if size < 1024:
        return f"{size} B"
    if size < 1024 ** 2:
        return f"{size / 1024:.1f} KB"
    return f"{size / 1024 ** 2:.1f} MB"
