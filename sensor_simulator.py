import time
import json
import random
from kafka import KafkaProducer

# 1. Connect to our Kafka "Post Office" running inside Docker
# 1. Connect to our Kafka "Post Office" running inside Docker
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    api_version=(3, 3, 0),  # <--- added this line to skip the timeout probe.
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
print("BioFlow IoT Sensor Simulator is ONLINE. Press Ctrl+C to stop.")

# 2. Simulate streaming telemetry data infinitely
try:
    while True:
        # Generate realistic biological fluid measurements
        telemetry_data = {
            "sensor_id": "flow_sensor_01",
            "flow_rate_lpm": round(random.uniform(12.5, 15.2), 2),  # Liters per minute
            "temperature_c": round(random.uniform(36.5, 37.5), 1),  # Ideal human body/biotech temp
            "ph_level": round(random.uniform(7.2, 7.4), 2),         # Neutral/physiological pH
            "timestamp": time.time()
        }
        
        # Send the packet to a Kafka box (Topic) named 'biotech-telemetry'
        producer.send('biotech-telemetry', value=telemetry_data)
        print(f"📡 Sent telemetry packet: {telemetry_data}")
        
        # Wait 1 second before sending the next measurement
        time.sleep(1)

except KeyboardInterrupt:
    print("\n🛑 Simulator stopped successfully.")
finally:
    producer.close()