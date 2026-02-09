import aiohttp
from typing import List, Dict


class HackerNewsService:
    """Client for the HackerNews Algolia Search API (no auth required)."""

    BASE_URL = "http://hn.algolia.com/api/v1"

    async def search_stories(self, query: str, limit: int = 20) -> List[Dict]:
        """Search HackerNews stories matching a query."""
        try:
            url = f"{self.BASE_URL}/search"
            params = {
                "query": query,
                "tags": "story",
                "hitsPerPage": limit,
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()

            results = []
            for hit in data.get("hits", []):
                results.append({
                    "id": hit.get("objectID", ""),
                    "title": hit.get("title", ""),
                    "url": hit.get("url", "") or f"https://news.ycombinator.com/item?id={hit.get('objectID', '')}",
                    "points": hit.get("points", 0) or 0,
                    "num_comments": hit.get("num_comments", 0) or 0,
                    "created_at": hit.get("created_at", ""),
                    "author": hit.get("author", ""),
                })
            return results
        except Exception as e:
            print(f"HackerNews search error: {e}")
            return []

    async def get_sentiment_signals(self, query: str) -> Dict:
        """Get aggregated engagement metrics as sentiment proxy."""
        stories = await self.search_stories(query, limit=30)
        if not stories:
            return {"avg_points": 0, "avg_comments": 0, "total_stories": 0, "max_points": 0}

        points = [s["points"] for s in stories]
        comments = [s["num_comments"] for s in stories]
        return {
            "avg_points": sum(points) / len(points) if points else 0,
            "avg_comments": sum(comments) / len(comments) if comments else 0,
            "total_stories": len(stories),
            "max_points": max(points) if points else 0,
            "top_stories": stories[:5],
        }


hackernews_service = HackerNewsService()
