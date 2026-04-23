import time
import os
import joblib
import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from schemas import MLTaskType, MLMetrics
from ml.utils import ALGO_NAMES
from ml.trainer import _train_single_algorithm

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer): return int(obj)
        if isinstance(obj, np.floating): return float(obj)
        if isinstance(obj, np.ndarray): return obj.tolist()
        if isinstance(obj, tuple): return list(obj)
        return super(NpEncoder, self).default(obj)

def train_model(
    task_type: MLTaskType,
    algorithm: str,
    project_id: str,
    data_file: str | None = None,
    feature_columns: list[str] | None = None,
    target_column: str | None = None,
    nan_strategy: str = "mean",
    scaling_strategy: str = "none",
    use_tuning: bool = False,
    custom_params: dict = None
) -> tuple[MLMetrics, str, list[str], dict]:
    t0 = time.perf_counter()
    logs = []
    ui_updates = {}
    
    if data_file and os.path.exists(data_file):
        try:
            df = pd.read_csv(data_file)
            logs.append(f"[prep] Loaded dataset with {len(df)} rows")

            selected_cols = []
            if feature_columns: selected_cols.extend(feature_columns)
            if target_column and target_column not in selected_cols: selected_cols.append(target_column)
            
            df_display = df[selected_cols].copy()
            preview_df = df_display.head(20).fillna("")
            
            ui_updates["previewData"] = {
                "columns": preview_df.columns.tolist(),
                "rows": preview_df.astype(str).values.tolist()
            }

            if nan_strategy == "drop":
                df = df.dropna()
            else:
                num_cols = df.select_dtypes(include=[np.number]).columns
                if len(num_cols) > 0:
                    imputer = SimpleImputer(strategy=nan_strategy)
                    df[num_cols] = imputer.fit_transform(df[num_cols])

            if task_type == MLTaskType.classification and target_column in df.columns:
                le_y = LabelEncoder()
                df[target_column] = le_y.fit_transform(df[target_column].astype(str))
                ui_updates["labelMapping"] = {int(i): str(l) for i, l in enumerate(le_y.classes_)}

            for col in feature_columns:
                if df[col].dtype == 'object' or df[col].dtype.name == 'category':
                    df[col] = LabelEncoder().fit_transform(df[col].astype(str))
            
            X = df[feature_columns].values
            y = df[target_column].values if target_column else None

            os.makedirs("/tmp/models", exist_ok=True)
            
            if scaling_strategy in ["x", "all"]:
                sc_x = StandardScaler()
                X = sc_x.fit_transform(X)
                joblib.dump(sc_x, f"/tmp/models/scaler_x_{project_id}.joblib")
            
            if scaling_strategy in ["y", "all"] and task_type == MLTaskType.regression:
                sc_y = StandardScaler()
                y = sc_y.fit_transform(y.reshape(-1, 1)).flatten()
                joblib.dump(sc_y, f"/tmp/models/scaler_y_{project_id}.joblib")

        except Exception as e:
            logs.append(f"[error] Preprocessing failed: {str(e)}")
            data_file = None

    if not data_file:
        from sklearn.datasets import make_classification, make_regression, make_blobs
        if task_type == MLTaskType.classification: X, y = make_classification(n_samples=500, n_features=len(feature_columns) if feature_columns else 8, random_state=42)
        elif task_type == MLTaskType.regression: X, y = make_regression(n_samples=500, n_features=len(feature_columns) if feature_columns else 8, random_state=42)
        else: X, _ = make_blobs(n_samples=500, centers=3, random_state=42); y = None

        mock_cols = feature_columns if feature_columns else [f"Feature_{i}" for i in range(X.shape[1])]
        mock_df = pd.DataFrame(X[:20], columns=mock_cols)
        ui_updates["previewData"] = {
            "columns": mock_df.columns.tolist(),
            "rows": mock_df.astype(str).values.tolist()
        }

    is_auto_mode = (algorithm == "auto")
    effective_tuning = True if is_auto_mode else use_tuning

    if is_auto_mode:
        if task_type == MLTaskType.classification: algos = ["rf_clf", "gb_clf", "lr_clf", "svm_clf"]
        elif task_type == MLTaskType.regression: algos = ["rf_reg", "gb_reg", "lr_reg", "ridge_reg"]
        else: algos = ["kmeans", "dbscan", "agglomerative", "gmm"]
    else:
        algos = [algorithm]

    best_acc = -1e9
    best_model, best_chart, best_det, best_scat, best_algo, best_params_found = None, [], [], None, algorithm, None

    for a in algos:
        try:
            m, acc, chart, det, scat, raw_params = _train_single_algorithm(task_type, a, X, y, feature_columns, effective_tuning, custom_params, is_auto_mode)
            logs.append(f"[eval] {ALGO_NAMES.get(a, a)} Score: {acc:.4f}")
            
            current_safe_params = None
            if raw_params is not None:
                current_safe_params = json.loads(json.dumps(raw_params, cls=NpEncoder))
                logs.append(f"[tuning] Best params for {a}: {json.dumps(current_safe_params)}")

            if acc >= best_acc:
                best_acc, best_model, best_chart, best_det, best_scat, best_algo, best_params_found = acc, m, chart, det, scat, a, current_safe_params
        except Exception as e:
            logs.append(f"[error] {a} failed: {str(e)}")

    model_path = f"/tmp/models/model_{project_id}.joblib"
    joblib.dump(best_model, model_path)
    
    metrics = MLMetrics(
        accuracy=best_acc,
        latency_ms=int((time.perf_counter() - t0) * 1000),
        model_size=f"{os.path.getsize(model_path) / 1024:.1f} KB",
        algorithm_name=ALGO_NAMES.get(best_algo, best_algo),
        chart_data=best_chart,
        detailed_metrics=best_det,
        scatter_data=best_scat,
        best_parameters=best_params_found or {}
    )
    
    return metrics, model_path, logs, ui_updates