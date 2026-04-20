import time
import os
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification, make_regression, make_blobs

# Klasifikasi
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier

# Regresi
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.linear_model import LinearRegression, Ridge

# Clustering
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, Birch
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score

from schemas import MLTaskType, MLMetrics

def extract_feature_weights(model, X_train):
    """Fungsi helper untuk mengekstrak atau mensimulasikan bobot fitur riil"""
    if hasattr(model, "feature_importances_"):
        return model.feature_importances_
    elif hasattr(model, "coef_"):
        # Ambil nilai absolut koefisien (untuk model linier/logistik)
        coefs = np.abs(model.coef_[0]) if model.coef_.ndim > 1 else np.abs(model.coef_)
        return coefs / np.sum(coefs) if np.sum(coefs) > 0 else coefs
    else:
        # Fallback rasional untuk algoritma berbasis jarak (KNN, SVM, dll)
        # Menghitung varians dari dataset latih sebagai proxy importance
        variances = np.var(X_train, axis=0)
        return variances / np.sum(variances)

def _train_single_algorithm(task_type: MLTaskType, algorithm: str, X, y):
    chart_data = []
    accuracy = 0.0
    model = None

    if task_type == MLTaskType.classification:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if algorithm == "svm_clf": model = SVC(probability=True, random_state=42)
        elif algorithm == "lr_clf": model = LogisticRegression(random_state=42)
        elif algorithm == "gb_clf": model = GradientBoostingClassifier(random_state=42)
        elif algorithm == "knn_clf": model = KNeighborsClassifier()
        else: model = RandomForestClassifier(n_estimators=100, random_state=42)
            
        model.fit(X_train, y_train)
        accuracy = float(model.score(X_test, y_test))
        importances = extract_feature_weights(model, X_train)
        chart_data = [{"name": f"Fitur {i+1}", "value": float(v)} for i, v in enumerate(importances)]
        
    elif task_type == MLTaskType.regression:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if algorithm == "svm_reg": model = SVR()
        elif algorithm == "lr_reg": model = LinearRegression()
        elif algorithm == "ridge_reg": model = Ridge(random_state=42)
        elif algorithm == "gb_reg": model = GradientBoostingRegressor(random_state=42)
        else: model = RandomForestRegressor(n_estimators=100, random_state=42)
            
        model.fit(X_train, y_train)
        accuracy = float(model.score(X_test, y_test))
        importances = extract_feature_weights(model, X_train)
        chart_data = [{"name": f"Fitur {i+1}", "value": float(v)} for i, v in enumerate(importances)]

    else: # Clustering
        if algorithm == "dbscan": model = DBSCAN(eps=1.5)
        elif algorithm == "agglomerative": model = AgglomerativeClustering(n_clusters=3)
        elif algorithm == "gmm": model = GaussianMixture(n_components=3, random_state=42)
        elif algorithm == "birch": model = Birch(n_clusters=3)
        else: model = KMeans(n_clusters=3, n_init=10, random_state=42)
            
        if algorithm in ["gmm", "kmeans", "birch"]:
            labels = model.fit_predict(X)
        else:
            labels = model.fit_predict(X) if hasattr(model, 'fit_predict') else model.fit(X).labels_
        
        try:
            score = silhouette_score(X, labels)
            accuracy = float((score + 1) / 2) # Normalisasi ke 0-1
        except ValueError:
            accuracy = 0.0 # Fallback
            
        variances = np.var(X, axis=0)
        importances = variances / np.sum(variances)
        chart_data = [{"name": f"Fitur {i+1}", "value": float(v)} for i, v in enumerate(importances)]

    return model, accuracy, chart_data

def train_model(task_type: MLTaskType, algorithm: str, project_id: str) -> tuple[MLMetrics, str]:
    t0 = time.perf_counter()
    
    # Generate Mock Data based on task type
    if task_type == MLTaskType.classification:
        X, y = make_classification(n_samples=1000, n_features=8, random_state=42)
        algorithms_to_try = ["rf_clf", "svm_clf", "lr_clf", "gb_clf", "knn_clf"] if algorithm == "auto" else [algorithm]
    elif task_type == MLTaskType.regression:
        X, y = make_regression(n_samples=1000, n_features=8, noise=0.1, random_state=42)
        algorithms_to_try = ["rf_reg", "svm_reg", "lr_reg", "ridge_reg", "gb_reg"] if algorithm == "auto" else [algorithm]
    else:
        X, _ = make_blobs(n_samples=1000, n_features=8, centers=3, random_state=42)
        y = None
        algorithms_to_try = ["kmeans", "dbscan", "agglomerative", "gmm", "birch"] if algorithm == "auto" else [algorithm]

    best_accuracy = -1.0
    best_model = None
    best_chart_data = []
    best_algorithm_name = algorithm

    for algo in algorithms_to_try:
        model, accuracy, chart_data = _train_single_algorithm(task_type, algo, X, y)
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_model = model
            best_chart_data = chart_data
            best_algorithm_name = algo

    latency = int((time.perf_counter() - t0) * 1000)
    
    # Simpan Model Fisik
    os.makedirs("/tmp/models", exist_ok=True)
    model_path = f"/tmp/models/model_{project_id}.joblib"
    joblib.dump(best_model, model_path)
    
    model_size = f"{os.path.getsize(model_path) / 1024:.1f} KB"
    
    # Mapping algorithm ids to human-readable names
    ALGO_NAMES = {
        "rf_clf": "Random Forest", "svm_clf": "Support Vector Machine", "lr_clf": "Logistic Regression", "gb_clf": "Gradient Boosting", "knn_clf": "K-Nearest Neighbors",
        "rf_reg": "Random Forest Regressor", "svm_reg": "Support Vector Regression", "lr_reg": "Linear Regression", "ridge_reg": "Ridge Regression", "gb_reg": "Gradient Boosting Regressor",
        "kmeans": "K-Means", "dbscan": "DBSCAN", "agglomerative": "Agglomerative", "gmm": "Gaussian Mixture", "birch": "BIRCH"
    }
    
    final_algo_name = ALGO_NAMES.get(best_algorithm_name, best_algorithm_name)
    
    metrics = MLMetrics(
        accuracy=best_accuracy,
        latency_ms=latency,
        model_size=model_size,
        algorithm_name=final_algo_name,
        chart_data=best_chart_data
    )
    
    return metrics, model_path