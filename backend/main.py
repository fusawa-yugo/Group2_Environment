import mysql.connector
import json
from datetime import datetime

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="your_username",
    password="your_password",
    database="your_database"
)
cursor = conn.cursor(dictionary=True)

# Define your query (adjust to your schema!)
cursor.execute("SELECT * FROM room_data")
rows = cursor.fetchall()

# Group rows by timestamp and room
grouped = {}
for row in rows:
    time_id = row['timestamp'].isoformat() + "Z"
    room_id = row['room']
    if time_id not in grouped:
        grouped[time_id] = {"time_id": time_id, "rooms": {}}
    grouped[time_id]["rooms"][room_id] = {
        "room_id": room_id,
        "noise": row["noise"],
        "brightness": row["brightness"],
        "crowd": row["crowd"],
        "score_study": row["score_study"],
        "score_relaxing": row["score_relaxing"],
        "score_eating": row["score_eating"],
        "score_socializing": row["score_socializing"]
    }

# Save to JSON
with open("room_data.json", "w") as f:
    json.dump({"time": list(grouped.values())}, f, indent=2)

cursor.close()
conn.close()
