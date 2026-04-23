import os
import socket
import platform
import time
import psutil
import shutil
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Build, APIKey

router = APIRouter()

def get_uptime():
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    days = int(uptime_seconds // (24 * 3600))
    hours = int((uptime_seconds % (24 * 3600)) // 3600)
    if days > 0:
        return f"{days}d {hours}h"
    return f"{hours}h {int((uptime_seconds % 3600) // 60)}m"

def get_network_latency():
    try:
        start = time.perf_counter()
        socket.create_connection(("8.8.8.8", 53), timeout=2)
        return int((time.perf_counter() - start) * 1000)
    except:
        return 0

@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db)):
    total_builds = db.query(Build).count()
    success_builds = db.query(Build).filter(Build.status == "done").all()
    active_keys_count = db.query(APIKey).filter(APIKey.is_active == True).count()
    
    avg_acc = 0
    if success_builds:
        avg_acc = sum([b.accuracy for b in success_builds if b.accuracy]) / len(success_builds) * 100

    cpu_usage = psutil.cpu_percent(interval=None)
    total_cores = psutil.cpu_count()
    active_cores = int((cpu_usage / 100) * total_cores) if total_cores else 0
    
    total, used, free = shutil.disk_usage("/")
    storage_used_gb = used / (1024**3)
    storage_total_gb = total / (1023**3)

    return {
        "totalBuilds": total_builds,
        "avgAccuracy": round(avg_acc, 1),
        "cpuUsage": cpu_usage,
        "totalCores": total_cores,
        "activeCores": active_cores,
        "storageUsed": f"{storage_used_gb:.1f}GB",
        "storageLimit": f"{storage_total_gb:.1f}GB",
        "storagePercent": round((used/total) * 100, 1),
        "computeStatus": "Active" if cpu_usage > 10 else "Idle",
        "activeKeys": active_keys_count,
        "region": os.getenv("SERVER_REGION", "Local Node"),
        "nodeId": socket.gethostname().upper(),
        "networkLatency": get_network_latency(),
        "uptime": get_uptime(),
        "userInitials": "JD"
    }