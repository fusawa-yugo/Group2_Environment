from db.query import *
from data.builder import generate_mockup_json
from config import SENSORS
from datetime import datetime, timedelta
import pandas as pd

def get_timestamp_intervals(hour_start, hour_end):
    now = datetime.now()

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

    intervals = [10, 12, 14, 16, 18]
    # 10-12
    time_start, time_end = get_timestamp_intervals(intervals[0], intervals[2])
    noise_data = query_noise_sensor(cursor, time_start, time_end)
    light_data = query_light_sensor(cursor, time_start, time_end)
    esms_data = query_esms_sensor(cursor, time_start, time_end)



    print("prova stampa sensor_data")
    print(noise_data)

    #organized_data = generate_mockup_json()
    #save_to_json(organized_data)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
    #print(get_timestamp_intervals(10, 12))