import numpy as np
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import PolynomialFeatures
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, ExtraTreesClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, Birch
from sklearn.mixture import GaussianMixture
from sklearn.metrics import (
    silhouette_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score,
    davies_bouldin_score, calinski_harabasz_score
)
from schemas import MLTaskType
from ml.utils import extract_feature_weights, _parse_custom_params

def _clean_dict(d):
    if not isinstance(d, dict): return d
    return {str(k): (v.item() if hasattr(v, 'item') else v) for k, v in d.items()}

def _train_single_algorithm(task_type, algorithm, X, y, feature_names=None, use_tuning=False, custom_params=None, is_auto_mode=False):
    chart_data, detailed_metrics, scatter_data, best_params = [], [], None, None
    accuracy, model, param_grid = 0.0, None, {}

    if task_type == MLTaskType.classification:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if algorithm == "lr_clf": 
            model = LogisticRegression(max_iter=2000, random_state=42); param_grid = {'C': [0.01, 0.1, 1, 10]}
        elif algorithm == "dt_clf": 
            model = DecisionTreeClassifier(random_state=42); param_grid = {'max_depth': [None, 5, 10, 20]}
        elif algorithm == "rf_clf": 
            model = RandomForestClassifier(random_state=42); param_grid = {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}
        elif algorithm == "gb_clf": 
            model = GradientBoostingClassifier(random_state=42); param_grid = {'n_estimators': [50, 100], 'learning_rate': [0.01, 0.1, 0.2]}
        elif algorithm == "svm_clf": 
            model = SVC(probability=True, random_state=42); param_grid = {'C': [0.1, 1, 10], 'kernel': ['linear', 'rbf']}
        elif algorithm == "knn_clf": 
            model = KNeighborsClassifier(); param_grid = {'n_neighbors': [3, 5, 7, 9]}
        elif algorithm == "nb_clf": model = GaussianNB()
        elif algorithm == "mlp_clf": 
            model = MLPClassifier(max_iter=2000, random_state=42); param_grid = {'hidden_layer_sizes': [(50,), (100,)], 'alpha': [0.0001, 0.001]}
        elif algorithm == "ada_clf": 
            model = AdaBoostClassifier(random_state=42); param_grid = {'n_estimators': [50, 100, 200]}
        elif algorithm == "et_clf": 
            model = ExtraTreesClassifier(random_state=42); param_grid = {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}
        else: model = RandomForestClassifier(n_estimators=100, random_state=42)
            
        if use_tuning:
            actual_grid = param_grid
            if not is_auto_mode and custom_params:
                try:
                    p = _parse_custom_params(custom_params)
                    if p: actual_grid = p
                except: pass
            if actual_grid:
                search = RandomizedSearchCV(model, actual_grid, n_iter=5, cv=3, random_state=42, n_jobs=-1)
                search.fit(X_train, y_train)
                model = search.best_estimator_
                best_params = _clean_dict(search.best_params_)
            else: model.fit(X_train, y_train)
        else: model.fit(X_train, y_train)
            
        y_pred = model.predict(X_test)
        accuracy = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        detailed_metrics = [
            {"name": "F1-Score", "value": accuracy},
            {"name": "Accuracy", "value": float(model.score(X_test, y_test))},
            {"name": "Precision", "value": float(precision_score(y_test, y_pred, average='weighted', zero_division=0))},
            {"name": "Recall", "value": float(recall_score(y_test, y_pred, average='weighted', zero_division=0))}
        ]
        weights = extract_feature_weights(model, X_train)
        chart_data = [{"name": feature_names[i] if feature_names else f"F{i+1}", "value": float(v)} for i, v in enumerate(weights)]

    elif task_type == MLTaskType.regression:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        if algorithm == "lr_reg": model = LinearRegression()
        elif algorithm == "ridge_reg": 
            model = Ridge(random_state=42); param_grid = {'alpha': [0.1, 1.0, 10.0]}
        elif algorithm == "lasso_reg": 
            model = Lasso(random_state=42); param_grid = {'alpha': [0.01, 0.1, 1.0]}
        elif algorithm == "elastic_reg": 
            model = ElasticNet(random_state=42); param_grid = {'alpha': [0.1, 1.0], 'l1_ratio': [0.2, 0.5, 0.8]}
        elif algorithm == "poly_reg": 
            model = make_pipeline(PolynomialFeatures(), LinearRegression()); param_grid = {'polynomialfeatures__degree': [2, 3]}
        elif algorithm == "dt_reg": 
            model = DecisionTreeRegressor(random_state=42); param_grid = {'max_depth': [None, 5, 10, 20]}
        elif algorithm == "rf_reg": 
            model = RandomForestRegressor(random_state=42); param_grid = {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}
        elif algorithm == "gb_reg": 
            model = GradientBoostingRegressor(random_state=42); param_grid = {'n_estimators': [50, 100], 'learning_rate': [0.01, 0.1, 0.2]}
        elif algorithm == "svm_reg": 
            model = SVR(); param_grid = {'C': [0.1, 1, 10], 'kernel': ['linear', 'rbf']}
        elif algorithm == "knn_reg": 
            model = KNeighborsRegressor(); param_grid = {'n_neighbors': [3, 5, 7, 9]}
        else: model = RandomForestRegressor(n_estimators=100, random_state=42)
            
        if use_tuning:
            actual_grid = param_grid
            if not is_auto_mode and custom_params:
                try:
                    p = _parse_custom_params(custom_params)
                    if p: actual_grid = p
                except: pass
            if actual_grid:
                search = RandomizedSearchCV(model, actual_grid, n_iter=5, cv=3, random_state=42, n_jobs=-1)
                search.fit(X_train, y_train)
                model = search.best_estimator_
                best_params = _clean_dict(search.best_params_)
            else: model.fit(X_train, y_train)
        else: model.fit(X_train, y_train)
            
        y_pred = model.predict(X_test)
        accuracy = float(r2_score(y_test, y_pred))
        detailed_metrics = [
            {"name": "R2 Score", "value": accuracy},
            {"name": "RMSE Error", "value": float(np.sqrt(mean_squared_error(y_test, y_pred)))},
            {"name": "MAE Error", "value": float(mean_absolute_error(y_test, y_pred))}
        ]
        weights = extract_feature_weights(model, X_train)
        chart_data = [{"name": feature_names[i] if feature_names else f"F{i+1}", "value": float(v)} for i, v in enumerate(weights)]
    else: 
        if algorithm == "dbscan": model = DBSCAN(eps=1.5)
        elif algorithm == "agglomerative": model = AgglomerativeClustering(n_clusters=3)
        elif algorithm == "gmm": model = GaussianMixture(n_components=3, random_state=42)
        elif algorithm == "birch": model = Birch(n_clusters=3)
        else: model = KMeans(n_clusters=3, n_init=10, random_state=42)
        labels = model.fit_predict(X) if hasattr(model, 'fit_predict') else model.fit(X).labels_
        if not hasattr(model, "predict"): model = KNeighborsClassifier(n_neighbors=3).fit(X, labels)
        try:
            sil = float(silhouette_score(X, labels)); accuracy = (sil + 1) / 2
        except: sil, accuracy = 0.0, 0.0
        detailed_metrics = [{"name": "Silhouette", "value": sil}]
        pca = PCA(n_components=2); X_pca = pca.fit_transform(X)
        idx = np.random.choice(len(X_pca), min(300, len(X_pca)), replace=False)
        scatter_data = [{"x": float(X_pca[i][0]), "y": float(X_pca[i][1]), "cluster": int(labels[i])} for i in idx]
        variances = np.var(X, axis=0); weights = variances / np.sum(variances) if np.sum(variances) > 0 else np.zeros(X.shape[1])
        chart_data = [{"name": feature_names[i] if feature_names else f"F{i+1}", "value": float(v)} for i, v in enumerate(weights)]

    return model, accuracy, chart_data, detailed_metrics, scatter_data, best_params