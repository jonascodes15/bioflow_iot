import os
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load database environment variables
load_dotenv()

app = FastAPI(
    title="BioFlow IoT API",
    description="Backend API serving real-time biological telemetry data",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing) so our React app can safely talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        return psycopg2.connect(
            host="localhost",
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port="5432"
        )
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

@app.get("/")
def read_root():
    return {"message": "Welcome to the BioFlow IoT API. Access /docs for interactive API testing!"}

@app.get("/api/telemetry")
def get_telemetry(limit: int = 50):
    """Fetch the latest N telemetry records from the database"""
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        cursor = connection.cursor()
        # Query the latest records descending by database receipt timestamp
        query = """
        SELECT id, sensor_id, flow_rate_lpm, temperature_c, ph_level, recorded_at, sensor_timestamp 
        FROM biological_telemetry 
        ORDER BY id DESC 
        LIMIT %s;
        """
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()
        
        # Format the SQL response into structured JSON
        telemetry_data = []
        for row in rows:
            telemetry_data.append({
                "id": row[0],
                "sensor_id": row[1],
                "flow_rate_lpm": row[2],
                "temperature_c": row[3],
                "ph_level": row[4],
                "recorded_at": row[5].isoformat() if row[5] else None,
                "sensor_timestamp": row[6]
            })
        
        return telemetry_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/api/telemetry/latest")
def get_latest_telemetry():
    """Fetch the single most recent telemetry packet"""
    data = get_telemetry(limit=1)
    if data:
        return data[0]
    raise HTTPException(status_code=404, detail="No telemetry records found")