from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.core.constants import DEFAULT_STATUS, DEFAULT_PRIORITY


class UserProblemCard(BaseModel):
    gap: str
    context: str
    source_citation: str
    proposed_solution: str
    novelty_score: float
    domain: str = ""
    is_manual: bool = False
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    # Issue tracking fields
    status: str = DEFAULT_STATUS
    priority: str = DEFAULT_PRIORITY
    tags: List[str] = []
    assignee: str = ""
    updated_at: Optional[str] = None


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


class UpdateCardRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    assignee: Optional[str] = None


class BacklogStats(BaseModel):
    total_cards: int = 0
    by_status: dict = {}
    by_priority: dict = {}
    by_domain: dict = {}
