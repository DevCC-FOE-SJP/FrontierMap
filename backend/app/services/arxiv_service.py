import arxiv
from typing import List, Dict

class ArxivService:
    def __init__(self):
        self.client = arxiv.Client()

    def search_papers(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for papers on arXiv based on a query.
        Filters for recent papers to ensure "bleeding-edge" relevant.
        """
        search = arxiv.Search(
            query=query,
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance,
            sort_order=arxiv.SortOrder.Descending
        )

        results = []
        for result in self.client.results(search):
            results.append({
                "id": result.entry_id,
                "title": result.title,
                "summary": result.summary,
                "authors": [author.name for author in result.authors],
                "published": result.published.isoformat(),
                "url": result.pdf_url,
                "categories": result.categories
            })
        
        return results

arxiv_service = ArxivService()
