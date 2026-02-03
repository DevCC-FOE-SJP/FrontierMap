import praw
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class RedditService:
    def __init__(self):
        self.reddit = None
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        
        if client_id and client_secret and "your_" not in client_id:
            try:
                self.reddit = praw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent="FrontierMap v0.1.0"
                )
            except Exception as e:
                print(f"Info: Reddit API not active. (Error: {e})")


    def search_discussions(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search for relevant technical discussions on Reddit.
        """
        if not self.reddit:
            return []

        results = []
        try:
            # We can search specific subreddits or all
            for submission in self.reddit.subreddit("all").search(query, limit=limit, sort="relevance"):
                # Basic check to filter for more technical/relevant subreddits if needed
                # For now, we take all but prioritize score/relevance
                results.append({
                    "id": submission.id,
                    "title": submission.title,
                    "text": submission.selftext[:1000] if submission.selftext else "", # Limit text size
                    "url": f"https://www.reddit.com{submission.permalink}",
                    "score": submission.score,
                    "subreddit": submission.subreddit.display_name,
                    "created_utc": submission.created_utc
                })
        except Exception as e:
            print(f"Error searching Reddit: {e}")
        
        return results

reddit_service = RedditService()
