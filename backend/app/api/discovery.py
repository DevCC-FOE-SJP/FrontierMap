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
