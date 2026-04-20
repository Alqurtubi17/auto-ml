# backend/services/ml_generator.py
from __future__ import annotations
from schemas import MLTaskType

def generate_deployment_code(project_name: str, task_type: MLTaskType) -> str:
    """Menghasilkan source code Python untuk dipreview user."""
    
    code = f'"""\nSource code otomatis untuk project: {project_name}\nTugas: {task_type.value.capitalize()}\n"""\n'
    code += "import joblib\nimport pandas as pd\n\n"
    
    code += "# 1. Muat model yang telah dilatih\n"
    code += "print('Memuat model...')\n"
    code += "model = joblib.load('model_terlatih.pkl')\n\n"
    
    if task_type == MLTaskType.classification:
        code += "# 2. Contoh Prediksi Klasifikasi\n"
        code += "sample_data = pd.DataFrame([{'fitur_1': 5.1, 'fitur_2': 3.5}])\n"
        code += "hasil = model.predict(sample_data)\n"
        code += "print(f'Hasil Klasifikasi: {hasil[0]}')\n"
    elif task_type == MLTaskType.regression:
        code += "# 2. Contoh Prediksi Regresi (Misal: Harga/Suhu)\n"
        code += "sample_data = pd.DataFrame([{'fitur_1': 120, 'fitur_2': 3}])\n"
        code += "hasil = model.predict(sample_data)\n"
        code += "print(f'Prediksi Nilai: {hasil[0]:.2f}')\n"
    else:
        code += "# 2. Contoh Clustering\n"
        code += "sample_data = pd.DataFrame([{'fitur_1': 1.2, 'fitur_2': 0.8}])\n"
        code += "cluster_id = model.predict(sample_data)\n"
        code += "print(f'Data masuk ke Cluster: {cluster_id[0]}')\n"
        
    return code