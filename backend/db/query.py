import mysql.connector
from config import DB_CONFIG

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def query_sensor_data(cursor, table_name, value_column, limit=10):
    query = f"SELECT timestamp, device_id, {value_column} FROM {table_name} LIMIT {limit}"
    cursor.execute(query)
    return cursor.fetchall()



def query_noise_sensor(cursor,time_start, time_end):
    query = f"SELECT * FROM plugin_ambient_noise AS n Where n.timestamp BETWEEN {time_start} AND {time_end};"
    cursor.execute(query)
    return cursor.fetchall()

def query_light_sensor(cursor,time_start, time_end):
    query = f"SELECT * FROM light AS l Where l.timestamp BETWEEN {time_start} AND {time_end};"
    cursor.execute(query)
    return cursor.fetchall()

def query_esms_sensor(cursor,time_start, time_end):
    query = f"SELECT timestamp, esm_json, double_esm_user_answer_timestamp, esm_user_answer, device_id  FROM esms AS n Where n.esm_status = 2 AND n.timestamp BETWEEN {time_start} AND {time_end};"
    cursor.execute(query)
    return cursor.fetchall()

def query_bluetooth_sensor(cursor, time_start, time_end):
    query = f"SELECT timestamp, device_id, bt_address FROM bluetooth AS b Where b.timestamp BETWEEN {time_start} AND {time_end};"
    cursor.execute(query)
    return cursor.fetchall()



def query_sensor_data_timestamp(cursor,time_start, time_end):
    query = f"SELECT \
            e.timestamp AS esm_timestamp,\
            l.timestamp AS light_timestamp,\
            n.timestamp AS noise_timestamp,\
            e.device_id, \
            e.esm_user_answer, \
            l.double_light_lux,\
            n.double_decibels \
        FROM esms e \
        JOIN light l ON \
            e.device_id = l.device_id AND \
            ABS(e.timestamp - l.timestamp) <= 5000  \
        JOIN plugin_ambient_noise n ON \
            e.device_id = n.device_id AND \
            ABS(e.timestamp - n.timestamp) <= 5000  \
        WHERE e.timestamp BETWEEN {time_start} AND {time_end};"
    
    cursor.execute(query)
    return cursor.fetchall()




"""
Query example

SELECT 
    e.timestamp AS esm_timestamp,
    l.timestamp AS light_timestamp,
    n.timestamp AS noise_timestamp,
    e.device_id, 
    e.esm_user_answer, 
    l.double_light_lux,
    n.double_decibels
FROM esms e
JOIN light l ON 
    e.device_id = l.device_id AND
    ABS(e.timestamp - l.timestamp) <= 5000  -- Tolleranza di 5 secondi
JOIN plugin_ambient_noise n ON
    e.device_id = n.device_id AND
    ABS(e.timestamp - n.timestamp) <= 5000  
WHERE e.timestamp BETWEEN 1749633215706 AND 1749649069738;

"""