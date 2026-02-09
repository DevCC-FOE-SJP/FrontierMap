import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()


class DiscordService:
    """
    Discord integration via stored messages.
    Requires a Discord bot to push messages to MongoDB.
    If no bot is configured, gracefully returns empty results.
    """

    def __init__(self):
        self.bot_token = os.getenv("DISCORD_BOT_TOKEN")
        self.active = bool(self.bot_token and "your_" not in self.bot_token)
        if not self.active:
            print("Info: Discord integration not configured. Set DISCORD_BOT_TOKEN to enable.")

    async def search_messages(self, query: str, limit: int = 10) -> List[Dict]:
        """Search stored Discord messages from MongoDB."""
        if not self.active:
            return []

        try:
            from app.core.database import db
            if db.db is None:
                return []
            cursor = db.db["discord_messages"].find(
                {"$text": {"$search": query}}
            ).limit(limit)
            results = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                results.append({
                    "id": doc.get("message_id", str(doc["_id"])),
                    "content": doc.get("content", ""),
                    "channel": doc.get("channel_name", ""),
                    "server": doc.get("server_name", ""),
                    "author": doc.get("author", ""),
                    "timestamp": doc.get("timestamp", ""),
                })
            return results
        except Exception as e:
            print(f"Discord search error: {e}")
            return []

    async def get_sentiment_signals(self, query: str) -> Dict:
        """Get basic engagement metrics from stored Discord data."""
        messages = await self.search_messages(query, limit=30)
        return {
            "total_messages": len(messages),
            "channels": list(set(m.get("channel", "") for m in messages)),
        }


discord_service = DiscordService()
