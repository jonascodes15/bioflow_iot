import os
import json
import psycopg2
from datetime import datetime
from kafka import KafkaConsumer
from dotenv import load_dotenv

# Load database credentials from .env
load_dotenv()

# 1. Connect to our PostgreSQL Database
db_connection = psycopg2.connect(
    host="localhost",
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port="5432"
)
db_cursor = db_connection.cursor()

# 2. Connect to our Kafka Topic
consumer = KafkaConsumer(
    'biotech-telemetry',
    bootstrap_servers=['localhost:9092'],
    api_version=(3, 3, 0),
    auto_offset_reset='earliest',  # Start reading from the very beginning of the queue
    enable_auto_commit=True,
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)

print("📥 BioFlow DB Consumer is ONLINE. Waiting for telemetry packets...")

try:
    for message in consumer:
        data = message.value
        print(f"📥 Received from Kafka: {data}")
        
        # 3. Insert the sensor data into PostgreSQL
        insert_query = """
        INSERT INTO biological_telemetry (sensor_id, flow_rate_lpm, temperature_c, ph_level, sensor_timestamp)
        VALUES (%s, %s, %s, %s, %s);
        """
        db_cursor.execute(insert_query, (
            data["sensor_id"],
            data["flow_rate_lpm"],
            data["temperature_c"],
            data["ph_level"],
            data["timestamp"]
        ))
        
        # Commit transaction to save permanently
        db_connection.commit()
        print("💾 Successfully saved packet to PostgreSQL Database!")

except KeyboardInterrupt:
    print("\n🛑 Consumer stopped successfully.")
finally:
    db_cursor.close()
    db_connection.close()