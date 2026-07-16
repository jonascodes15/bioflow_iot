import os
import psycopg2
from dotenv import load_dotenv

# Load database credentials from the .env file
load_dotenv()

def setup_database():
    try:
        # Connect to PostgreSQL container
        connection = psycopg2.connect(
            host="localhost",
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port="5432"
        )
        cursor = connection.cursor()

        # SQL command to create our telemetry table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS biological_telemetry (
            id SERIAL PRIMARY KEY,
            sensor_id VARCHAR(50) NOT NULL,
            flow_rate_lpm REAL NOT NULL,
            temperature_c REAL NOT NULL,
            ph_level REAL NOT NULL,
            recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            sensor_timestamp DOUBLE PRECISION NOT NULL
        );
        """

        cursor.execute(create_table_query)
        connection.commit()
        print("📊 Database table 'biological_telemetry' created successfully!")

    except Exception as error:
        print(f"❌ Error setting up database: {error}")
    finally:
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    setup_database()