import json
import os
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

class ExpressibleLogger:

    @staticmethod
    def log(data, filename="trace_log.json"):
        data["timestamp"] = datetime.now().isoformat()

        file_path = os.path.join(LOG_DIR, filename)

        with open(file_path, "a") as f:
            f.write(json.dumps(data) + "\n")
