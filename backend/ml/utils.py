import ast
import numpy as np

ALGO_NAMES = {
    "lr_clf": "Logistic Regression", "dt_clf": "Decision Tree", "rf_clf": "Random Forest",
    "gb_clf": "Gradient Boosting", "svm_clf": "SVM", "knn_clf": "K-Nearest Neighbors",
    "nb_clf": "Naive Bayes", "mlp_clf": "Neural Networks", "ada_clf": "AdaBoost", "et_clf": "Extra Trees",
    "lr_reg": "Linear Regression", "ridge_reg": "Ridge Regression", "lasso_reg": "Lasso Regression",
    "elastic_reg": "Elastic Net", "poly_reg": "Polynomial Regression", "dt_reg": "Decision Tree",
    "rf_reg": "Random Forest", "gb_reg": "Gradient Boosting", "svm_reg": "SVR", "knn_reg": "KNN Regression",
    "kmeans": "K-Means", "dbscan": "DBSCAN", "agglomerative": "Agglomerative", "gmm": "Gaussian Mixture", "birch": "BIRCH"
}

def extract_feature_weights(model, X_train):
    try:
        target_model = model.steps[-1][1] if hasattr(model, "steps") else model
        if hasattr(target_model, "feature_importances_"):
            return target_model.feature_importances_
        elif hasattr(target_model, "coef_"):
            coefs = np.abs(target_model.coef_[0]) if target_model.coef_.ndim > 1 else np.abs(target_model.coef_)
            return coefs / np.sum(coefs) if np.sum(coefs) > 0 else coefs
        else:
            variances = np.var(X_train, axis=0)
            return variances / np.sum(variances) if np.sum(variances) > 0 else np.zeros(X_train.shape[1])
    except:
        return np.zeros(X_train.shape[1])

def _parse_custom_params(custom_params):
    parsed = {}
    for k, v in custom_params.items():
        if not isinstance(v, str): continue
        vals = [x.strip() for x in v.split(',')]
        parsed_vals = []
        for val in vals:
            if val.lower() == 'none':
                parsed_vals.append(None)
            elif val.startswith('(') and val.endswith(')'):
                try:
                    parsed_vals.append(ast.literal_eval(val))
                except:
                    pass
            else:
                try:
                    if '.' in val:
                        parsed_vals.append(float(val))
                    else:
                        parsed_vals.append(int(val))
                except ValueError:
                    parsed_vals.append(val)
        if parsed_vals:
            parsed[k] = parsed_vals
    return parsed