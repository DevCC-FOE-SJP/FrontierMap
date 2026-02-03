from fastapi import APIRouter, HTTPException
from typing import List
from app.services.arxiv_service import arxiv_service
from app.services.reddit_service import reddit_service
from app.services.analysis_service import analysis_service, ProblemCard

router = APIRouter(prefix="/discovery", tags=["discovery"])

@router.get("/gaps", response_model=List[ProblemCard])
async def get_innovation_gaps(domain: str, limit: int = 5):
    """
    Main endpoint to discover research gaps in a specific domain.
    Fetches data from arXiv and Reddit, then analyzes it using LLMs.
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

        # 3. Analyze and extract gaps
        gaps = await analysis_service.extract_gaps(all_sources)
        
        return gaps
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sources")
async def get_raw_sources(domain: str, limit: int = 5):
    """
    Helper endpoint to see the raw data being pulled.
    """
    papers = arxiv_service.search_papers(domain, max_results=limit)
    discussions = reddit_service.search_discussions(domain, limit=limit)
    
    return {
        "arxiv": papers,
        "reddit": discussions
    }

@router.get("/metrics")
async def get_research_metrics(domain: str = "machine learning"):
    """
    Fetch real-time research metrics for a given domain.
    """
    try:
        # Fetch recent papers
        papers = arxiv_service.search_papers(domain, max_results=20)
        
        # Calculate metrics
        total_papers = len(papers)
        
        # Get unique categories
        all_categories = []
        for paper in papers:
            all_categories.extend(paper.get("categories", []))
        unique_categories = list(set(all_categories))[:5]
        
        # Get top authors (by frequency)
        author_counts = {}
        for paper in papers:
            for author in paper.get("authors", []):
                author_counts[author] = author_counts.get(author, 0) + 1
        top_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "domain": domain,
            "total_papers_indexed": total_papers,
            "top_categories": unique_categories,
            "top_authors": [{"name": a[0], "paper_count": a[1]} for a in top_authors],
            "recent_papers": papers[:5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

