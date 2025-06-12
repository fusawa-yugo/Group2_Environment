import random
import json

def make_json(sensor_data):
    # structure {timestamp: {device_id: {sensor1: value, sensor2: value, ...}}}
    organized = {}
    for sensor, rows in sensor_data.items():
        for row in rows:
            ts = row['timestamp']
            dev = row['device_id']
            val = row[sensor]

            if ts not in organized:
                organized[ts] = {}
            if dev not in organized[ts]:
                organized[ts][dev] = {}
            organized[ts][dev][sensor] = val
    return organized


def generate_mockup_json(start_hour=10, num_hours=6, room_names=None, output_file="../json_data/mockup.json"):
    if room_names is None:
        room_names = ["room_a", "room_b", "room_c", "room_d", "room_e"]

    def random_room_data():
        return {
            "noise": round(random.uniform(30, 70), 1),
            "brightness": round(random.uniform(100, 500), 1),
            "crowd": round(random.uniform(0.0, 1.0), 2),
            "score_study": round(random.uniform(1.0, 5.0), 1),
            "score_relaxing": round(random.uniform(1.0, 5.0), 1),
            "score_eating": round(random.uniform(1.0, 5.0), 1),
            "score_socializing": round(random.uniform(1.0, 5.0), 1)
        }

    hours = []
    for h in range(start_hour, start_hour + num_hours):
        hour_data = {
            "hour": h,
            "rooms": {room: random_room_data() for room in room_names}
        }
        hours.append(hour_data)

    result = {"hours": hours}

    # Save to file
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)

    print(f"✅ Mockup JSON saved to {output_file}")
    return result
