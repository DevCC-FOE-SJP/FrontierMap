from typing import Dict
from app.services.hackernews_service import hackernews_service
from app.services.stackexchange_service import stackexchange_service
from app.services.reddit_service import reddit_service


class SentimentService:
    """
    Composite sentiment scorer.
    Aggregates engagement from Reddit, HackerNews, and StackExchange 
    to produce a 0-100 "pulse" score.
    """

    LABELS = [
        (25, "DEAD END"),
        (50, "LOW INTEREST"),
        (75, "GROWING"),
        (90, "HOT TOPIC"),
        (100, "BREAKTHROUGH"),
    ]

    def _get_label(self, score: float) -> str:
        for threshold, label in self.LABELS:
            if score <= threshold:
                return label
        return "BREAKTHROUGH"

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize a value to 0-100 range."""
        if max_val <= min_val:
            return 50.0
        normalized = ((value - min_val) / (max_val - min_val)) * 100
        return max(0.0, min(100.0, normalized))

    async def compute_pulse(self, domain: str) -> Dict:
        """
        Compute a composite sentiment/pulse score for a domain.
        
        Weights:
        - HackerNews: 40% (tech community engagement)
        - Reddit: 30% (broader community discussion)
        - StackExchange: 30% (technical depth / Q&A activity)
        """
        # Gather signals in parallel-ish (sequential for simplicity)
        hn_signals = await hackernews_service.get_sentiment_signals(domain)
        se_signals = await stackexchange_service.get_sentiment_signals(domain)

        # Reddit signals (sync call, run in thread)
        reddit_discussions = reddit_service.search_discussions(domain, limit=15)
        reddit_scores = [d.get("score", 0) for d in reddit_discussions]
        reddit_avg = sum(reddit_scores) / len(reddit_scores) if reddit_scores else 0

        # Normalize each signal to 0-100
        # HN: avg_points typically 1-500+
        hn_score = self._normalize(hn_signals.get("avg_points", 0), 0, 200)
        # SE: avg_score typically 0-50
        se_score = self._normalize(se_signals.get("avg_score", 0), 0, 30)
        # Reddit: avg upvotes typically 0-1000+
        reddit_score = self._normalize(reddit_avg, 0, 100)

        # Boost if there's high volume of content
        volume_boost = 0
        total_sources = (
            hn_signals.get("total_stories", 0) +
            se_signals.get("total_questions", 0) +
            len(reddit_discussions)
        )
        if total_sources > 30:
            volume_boost = 10
        elif total_sources > 15:
            volume_boost = 5

        # Weighted composite
        composite = (hn_score * 0.4) + (reddit_score * 0.3) + (se_score * 0.3) + volume_boost
        composite = max(0, min(100, composite))
        # Round to 1 decimal
        composite = round(composite, 1)

        label = self._get_label(composite)

        return {
            "score": composite,
            "label": label,
            "domain": domain,
            "sources": {
                "hackernews": {
                    "avg_points": round(hn_signals.get("avg_points", 0), 1),
                    "total_stories": hn_signals.get("total_stories", 0),
                    "top_stories": hn_signals.get("top_stories", [])[:3],
                },
                "reddit": {
                    "avg_score": round(reddit_avg, 1),
                    "total_discussions": len(reddit_discussions),
                },
                "stackexchange": {
                    "avg_score": round(se_signals.get("avg_score", 0), 1),
                    "total_questions": se_signals.get("total_questions", 0),
                    "answered_ratio": round(se_signals.get("answered_ratio", 0), 2),
                },
            },
        }


sentiment_service = SentimentService()
