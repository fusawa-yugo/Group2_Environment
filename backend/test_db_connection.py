import mysql.connector
import json
from datetime import datetime

# Connect to MySQL
conn = mysql.connector.connect(
    host="ubiss-2025-wsa.cvd47iwnttus.eu-central-1.rds.amazonaws.com",
    user="g2",
    password="g2pw9874875345",
    database="group2"
)
print(conn)
cursor = conn.cursor(dictionary=True)

# Define your query (adjust to your schema!)
cursor.execute("SELECT timestamp, device_id, double_decibels from plugin_ambient_noise LIMIT 10")
rows = cursor.fetchall()

for row in rows:
    print(row['timestamp'])

cursor.close()
conn.close()
