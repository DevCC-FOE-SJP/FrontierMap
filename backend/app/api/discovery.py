from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from collections import Counter
from datetime import datetime

from app.services.arxiv_service import arxiv_service
from app.services.reddit_service import reddit_service
from app.services.analysis_service import analysis_service, ProblemCard
from app.services.vector_service import vector_service
from app.services.hackernews_service import hackernews_service
from app.services.stackexchange_service import stackexchange_service
from app.services.sentiment_service import sentiment_service
from app.core.database import db

router = APIRouter(prefix="/discovery", tags=["discovery"])


# ---- Request/Response Models ----

class FeedbackRequest(BaseModel):
    card_gap: str
    domain: str
    action: str  # bookmarked, dismissed, upvoted, downvoted


class SaveCardRequest(BaseModel):
    gap: str
    context: str
    source_citation: str
    proposed_solution: str
    novelty_score: float
    domain: str = ""
    is_manual: bool = False


class GenerateCardRequest(BaseModel):
    domain: str
    sub_topic: str


# ---- Core Endpoints ----

@router.get("/gaps", response_model=List[ProblemCard])
async def get_innovation_gaps(domain: str, limit: int = 5):
    """
    Main endpoint to discover research gaps in a specific domain.
    Fetches data from arXiv and Reddit, then analyzes using LLMs.
    Incorporates user feedback for personalized recommendations.
    """
    try:
        # 1. Fetch from arXiv
        papers = arxiv_service.search_papers(domain, max_results=limit)

        # 2. Fetch from Reddit
        discussions = reddit_service.search_discussions(domain, limit=limit)

        # Combine sources
        all_sources = papers + discussions

        if not all_sources:
            return []

        # 3. Get user feedback for this domain (if any)
        feedback = await db.get_feedback_stats(domain)

        # 4. Analyze and extract gaps with feedback context
        gaps = await analysis_service.extract_gaps(all_sources, feedback=feedback)

        # 5. Upsert documents to vector store (non-blocking best effort)
        try:
            await vector_service.upsert_documents(all_sources)
        except Exception:
            pass  # Don't fail the request if vector upsert fails

        # 6. Save search history
        await db.save_search(domain, len(gaps))

        return gaps

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sources")
async def get_raw_sources(domain: str, limit: int = 5):
    """
    Helper endpoint to see the raw data being pulled from all sources.
    """
    papers = arxiv_service.search_papers(domain, max_results=limit)
    discussions = reddit_service.search_discussions(domain, limit=limit)
    hn_stories = await hackernews_service.search_stories(domain, limit=limit)
    se_questions = await stackexchange_service.search_questions(domain, limit=limit)

    return {
        "arxiv": papers,
        "reddit": discussions,
        "hackernews": hn_stories,
        "stackexchange": se_questions,
    }


@router.get("/metrics")
async def get_research_metrics(domain: str = "machine learning"):
    """
    Fetch comprehensive research metrics for a given domain.
    Includes real velocity data, sentiment, and authors.
    """
    try:
        # Fetch recent papers (larger set for better metrics)
        papers = arxiv_service.search_papers(domain, max_results=30)

        # Calculate velocity data — papers grouped by month
        velocity_data = []
        month_counts = Counter()
        for paper in papers:
            try:
                pub_date = datetime.fromisoformat(paper["published"].replace("Z", "+00:00"))
                month_key = pub_date.strftime("%b %Y").upper()
                month_counts[month_key] += 1
            except (ValueError, KeyError):
                pass

        # Sort months chronologically and take last 6
        sorted_months = sorted(
            month_counts.items(),
            key=lambda x: datetime.strptime(x[0], "%b %Y"),
        )[-6:]
        velocity_data = [{"name": m[0], "value": m[1]} for m in sorted_months]

        # If we don't have enough month data, supplement with what we have
        if len(velocity_data) < 2:
            velocity_data = [{"name": "RECENT", "value": len(papers)}]

        # Get unique categories
        all_categories = []
        for paper in papers:
            all_categories.extend(paper.get("categories", []))
        unique_categories = list(set(all_categories))[:10]

        # Get top authors (by frequency)
        author_counts = {}
        for paper in papers:
            for author in paper.get("authors", []):
                author_counts[author] = author_counts.get(author, 0) + 1
        top_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        # Compute growth rate
        if len(velocity_data) >= 2:
            latest = velocity_data[-1]["value"]
            previous = velocity_data[-2]["value"]
            growth = ((latest - previous) / max(previous, 1)) * 100
        else:
            growth = 0

        # Get sentiment
        try:
            pulse = await sentiment_service.compute_pulse(domain)
        except Exception:
            pulse = {"score": 50.0, "label": "GROWING", "sources": {}}

        # Get HN and SE counts
        hn_signals = await hackernews_service.get_sentiment_signals(domain)
        se_signals = await stackexchange_service.get_sentiment_signals(domain)

        return {
            "domain": domain,
            "total_papers_indexed": len(papers),
            "top_categories": unique_categories,
            "top_authors": [
                {"name": a[0], "paper_count": a[1], "field": unique_categories[i % len(unique_categories)] if unique_categories else "GENERAL"}
                for i, a in enumerate(top_authors)
            ],
            "recent_papers": papers[:5],
            "velocity_data": velocity_data,
            "growth_rate": round(growth, 1),
            "sentiment": pulse,
            "hackernews_mentions": hn_signals.get("total_stories", 0),
            "stackexchange_questions": se_signals.get("total_questions", 0),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Pulse / Sentiment ----

@router.get("/pulse")
async def get_pulse(domain: str = "machine learning"):
    """
    Get real-time community sentiment / pulse for a domain.
    Aggregates Reddit, HackerNews, and StackExchange engagement.
    """
    try:
        pulse = await sentiment_service.compute_pulse(domain)
        # Try to save snapshot to MongoDB
        await db.save_sentiment(pulse)
        return pulse
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Cards CRUD ----

@router.post("/cards")
async def save_problem_card(card: SaveCardRequest):
    """Save a manually-created or AI-generated problem card."""
    card_data = card.model_dump()
    card_id = await db.save_card(card_data)
    return {"status": "saved", "id": card_id, "card": card_data}


@router.get("/cards")
async def get_saved_cards(domain: str = ""):
    """Retrieve saved problem cards, optionally filtered by domain."""
    if domain:
        cards = await db.get_cards_by_domain(domain)
    else:
        if db.db is not None:
            cursor = db.db["problem_cards"].find().sort("created_at", -1).limit(50)
            cards = []
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                cards.append(doc)
        else:
            cards = []
    return {"cards": cards}


@router.post("/cards/generate")
async def generate_card(req: GenerateCardRequest):
    """Use AI to generate a single ProblemCard for a specific sub-topic."""
    try:
        card = await analysis_service.generate_single_card(req.domain, req.sub_topic)
        if card:
            return card.model_dump()
        raise HTTPException(status_code=500, detail="Failed to generate card")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Feedback ----

@router.post("/feedback")
async def post_feedback(feedback: FeedbackRequest):
    """Record user feedback (bookmark/dismiss/upvote/downvote) for a card."""
    feedback_data = feedback.model_dump()
    feedback_id = await db.save_feedback(feedback_data)
    return {"status": "recorded", "id": feedback_id}


@router.get("/feedback/stats")
async def get_feedback_stats(domain: str):
    """Get feedback statistics for a domain."""
    stats = await db.get_feedback_stats(domain)
    return stats


# ---- Search History ----

@router.get("/history")
async def get_search_history(limit: int = 20):
    """Get recent search history."""
    history = await db.get_search_history(limit)
    return {"searches": history}


# ---- Export ----

@router.get("/export")
async def get_export_data(domain: str = "machine learning"):
    """
    Get aggregated data for PDF export.
    Returns metrics, cards, sentiment in a structured format.
    """
    try:
        metrics = await get_research_metrics(domain)
        pulse = await sentiment_service.compute_pulse(domain)
        saved_cards = await db.get_cards_by_domain(domain)

        return {
            "domain": domain,
            "generated_at": datetime.utcnow().isoformat(),
            "metrics": metrics,
            "sentiment": pulse,
            "saved_cards": saved_cards,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

