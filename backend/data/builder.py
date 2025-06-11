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
