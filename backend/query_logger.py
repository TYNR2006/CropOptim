import os
import csv
from datetime import datetime

LOG_FILE = "query_logs.csv"

# Create file if not exists and add headers
if not os.path.isfile(LOG_FILE):
    with open(LOG_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "query", "prediction"])

def log_query(query, prediction):
    with open(LOG_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([datetime.now().isoformat(), query, prediction])
