import aiohttp
from typing import List, Dict


class StackExchangeService:
    """Client for Stack Exchange API v2.3 (no key needed for low-rate usage)."""

    BASE_URL = "https://api.stackexchange.com/2.3"

    async def search_questions(self, query: str, site: str = "stackoverflow", limit: int = 15) -> List[Dict]:
        """Search for relevant questions on Stack Exchange."""
        try:
            url = f"{self.BASE_URL}/search/advanced"
            params = {
                "q": query,
                "site": site,
                "pagesize": min(limit, 30),
                "order": "desc",
                "sort": "relevance",
                "filter": "withbody",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()

            results = []
            for item in data.get("items", []):
                body = item.get("body", "")
                # Strip HTML tags for a text snippet
                import re
                text_snippet = re.sub(r'<[^>]+>', '', body)[:500]
                results.append({
                    "id": item.get("question_id", 0),
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "score": item.get("score", 0),
                    "answer_count": item.get("answer_count", 0),
                    "tags": item.get("tags", []),
                    "body_snippet": text_snippet,
                    "is_answered": item.get("is_answered", False),
                    "view_count": item.get("view_count", 0),
                })
            return results
        except Exception as e:
            print(f"StackExchange search error: {e}")
            return []

    async def get_sentiment_signals(self, query: str) -> Dict:
        """Get aggregated engagement metrics."""
        questions = await self.search_questions(query, limit=20)
        if not questions:
            return {"avg_score": 0, "avg_answers": 0, "total_questions": 0}

        scores = [q["score"] for q in questions]
        answers = [q["answer_count"] for q in questions]
        return {
            "avg_score": sum(scores) / len(scores) if scores else 0,
            "avg_answers": sum(answers) / len(answers) if answers else 0,
            "total_questions": len(questions),
            "answered_ratio": sum(1 for q in questions if q["is_answered"]) / len(questions) if questions else 0,
            "top_questions": questions[:5],
        }


stackexchange_service = StackExchangeService()
