import mysql.connector
from config import DB_CONFIG

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def query_sensor_data(cursor, table_name, value_column, limit=10):
    query = f"SELECT timestamp, device_id, {value_column} FROM {table_name} LIMIT {limit}"
    cursor.execute(query)
    return cursor.fetchall()
