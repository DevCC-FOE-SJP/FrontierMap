import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class VectorService:
    def __init__(self):
        self.pc = None
        self.index_name = "frontier-map-index"
        api_key = os.getenv("PINECONE_API_KEY")
        
        if api_key and "your_" not in api_key:
            try:
                self.pc = Pinecone(api_key=api_key)
                # Create index if it doesn't exist
                if self.index_name not in self.pc.list_indexes().names():
                    self.pc.create_index(
                        name=self.index_name,
                        dimension=1536, 
                        metric='cosine',
                        spec=ServerlessSpec(
                            cloud='aws',
                            region='us-east-1' 
                        )
                    )
                self.index = self.pc.Index(self.index_name)
            except Exception as e:
                print(f"Info: Vector search inactive. (Error: {e})")


    async def upsert_documents(self, documents: List[Dict[str, Any]]):
        """
        Convert text to embeddings and upsert to Pinecone.
        """
        if not self.pc or not documents:
            return

        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        
        vectors = []
        for doc in documents:
            text = f"{doc.get('title', '')} {doc.get('summary', '') or doc.get('text', '')}"
            vector = await embeddings.aembed_query(text)
            
            vectors.append({
                "id": doc.get("id"),
                "values": vector,
                "metadata": {
                    "title": doc.get("title"),
                    "url": doc.get("url"),
                    "source": "arxiv" if "arxiv" in doc.get("url", "") else "reddit"
                }
            })
        
        self.index.upsert(vectors=vectors)

    async def query_similar(self, query_text: str, top_k: int = 5):
        """
        Search for semantically similar gaps or papers.
        """
        if not self.pc:
            return []
        
        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        query_vector = await embeddings.aembed_query(query_text)
        
        results = self.index.query(vector=query_vector, top_k=top_k, include_metadata=True)
        return results.matches

vector_service = VectorService()
