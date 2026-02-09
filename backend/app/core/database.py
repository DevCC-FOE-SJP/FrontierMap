import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        """Create database connection."""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name = os.getenv("DATABASE_NAME", "FrontierMap")
        
        try:
            cls.client = AsyncIOMotorClient(mongodb_url, serverSelectionTimeoutMS=3000)
            # Test the connection
            await cls.client.admin.command('ping')
            cls.db = cls.client[db_name]
            print(f"Connected to MongoDB at {mongodb_url}")
        except Exception as e:
            print(f"Warning: MongoDB not available ({e}). Running without persistence.")
            cls.client = None
            cls.db = None

    @classmethod
    async def close_db(cls):
        """Close database connection."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection closed")

    # ---- Problem Cards CRUD ----
    @classmethod
    async def save_card(cls, card_data: dict):
        if cls.db is None:
            return None
        card_data["created_at"] = datetime.utcnow().isoformat()
        result = await cls.db["problem_cards"].insert_one(card_data)
        return str(result.inserted_id)

    @classmethod
    async def get_cards_by_domain(cls, domain: str):
        if cls.db is None:
            return []
        cursor = cls.db["problem_cards"].find({"domain": domain}).sort("created_at", -1)
        cards = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            cards.append(doc)
        return cards

    # ---- Feedback CRUD ----
    @classmethod
    async def save_feedback(cls, feedback_data: dict):
        if cls.db is None:
            return None
        feedback_data["timestamp"] = datetime.utcnow().isoformat()
        result = await cls.db["feedback"].insert_one(feedback_data)
        return str(result.inserted_id)

    @classmethod
    async def get_feedback_stats(cls, domain: str):
        if cls.db is None:
            return {"bookmarked": [], "dismissed": []}
        bookmarked = []
        dismissed = []
        cursor = cls.db["feedback"].find({"domain": domain})
        async for doc in cursor:
            if doc.get("action") == "bookmarked":
                bookmarked.append(doc.get("card_gap", ""))
            elif doc.get("action") == "dismissed":
                dismissed.append(doc.get("card_gap", ""))
        return {"bookmarked": bookmarked, "dismissed": dismissed}

    # ---- Search History ----
    @classmethod
    async def save_search(cls, domain: str, result_count: int):
        if cls.db is None:
            return None
        result = await cls.db["searches"].insert_one({
            "domain": domain,
            "result_count": result_count,
            "timestamp": datetime.utcnow().isoformat()
        })
        return str(result.inserted_id)

    @classmethod
    async def get_search_history(cls, limit: int = 20):
        if cls.db is None:
            return []
        cursor = cls.db["searches"].find().sort("timestamp", -1).limit(limit)
        searches = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            searches.append(doc)
        return searches

    # ---- Sentiment Snapshots ----
    @classmethod
    async def save_sentiment(cls, sentiment_data: dict):
        if cls.db is None:
            return None
        sentiment_data["timestamp"] = datetime.utcnow().isoformat()
        result = await cls.db["sentiment"].insert_one(sentiment_data)
        return str(result.inserted_id)

    @classmethod
    async def get_latest_sentiment(cls, domain: str):
        if cls.db is None:
            return None
        doc = await cls.db["sentiment"].find_one(
            {"domain": domain}, sort=[("timestamp", -1)]
        )
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

db = Database()
