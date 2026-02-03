import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        """Create database connection."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DATABASE_NAME", "FrontierMap")
        
        cls.client = AsyncIOMotorClient(mongodb_url)
        cls.db = cls.client[db_name]
        print(f"Connected to MongoDB at {mongodb_url}")

    @classmethod
    async def close_db(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection closed")

db = Database()
