from db.query import *
from data.builder import generate_mockup_json
from data.data_preparation import *
from config import SENSORS
import datetime
import pandas as pd

def get_timestamp_intervals(hour_start, hour_end):
    #now = datetime.now()
    now = datetime.datetime(2025,6,12)

    # Crea i datetime per oggi all'ora specificata
    start_time = now.replace(hour=hour_start, minute=0, second=0, microsecond=0)
    end_time = now.replace(hour=hour_end, minute=0, second=0, microsecond=0)

    # Convertili in timestamp in millisecondi
    start_timestamp = int(start_time.timestamp() * 1000)
    end_timestamp = int(end_time.timestamp() * 1000)
    return start_timestamp, end_timestamp



def main():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    """
    sensor_data = {}
    for table, column in SENSORS.items():
        sensor_data[column] = query_sensor_data(cursor, table, column, limit=100)
    """

    intervals = [10, 12, 14, 16]
    hours_json = []
    for i in range(len(intervals)):
        print("interval: ", i)
        time_start, time_end = get_timestamp_intervals(intervals[i], intervals[i]+2)
        noise_data = query_noise_sensor(cursor, time_start, time_end)
        light_data = query_light_sensor(cursor, time_start, time_end)
        esms_data = query_esms_sensor(cursor, time_start, time_end)

        data = organize_data(noise_data, light_data, esms_data, intervals[i])
        hours_json.append(data)

    final_json = {"hours": hours_json}

    print(final_json["hours"][0])

    with open("../json_data/output.json", "w") as f:
        json.dump(final_json, f, indent=2)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
    #print(get_timestamp_intervals(10, 12))