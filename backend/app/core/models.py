from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class UserProblemCard(BaseModel):
    gap: str
    context: str
    source_citation: str
    proposed_solution: str
    novelty_score: float
    domain: str = ""
    is_manual: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class SearchHistory(BaseModel):
    domain: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    result_count: int = 0


class FeedbackEntry(BaseModel):
    card_gap: str
    domain: str
    action: str  # bookmarked, dismissed, upvoted, downvoted
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class SentimentSnapshot(BaseModel):
    domain: str
    score: float  # 0-100
    label: str  # DEAD END, LOW INTEREST, GROWING, HOT TOPIC, BREAKTHROUGH
    sources: dict = {}
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
