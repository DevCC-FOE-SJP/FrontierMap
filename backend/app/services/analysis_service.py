import os
from typing import List, Dict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class ProblemCard(BaseModel):
    gap: str = Field(description="The specific research or implementation gap identified.")
    context: str = Field(description="Background information and why this gap is important.")
    source_citation: str = Field(description="Brief reference to the source (e.g., 'arXiv:2104.XXXX' or 'Reddit thread in r/ML').")
    proposed_solution: str = Field(description="A high-level direction for a project to solve this gap.")
    novelty_score: float = Field(description="A score from 1-10 on how unique/unsolved this problem is based on the source context.")

class ProblemCardList(BaseModel):
    cards: List[ProblemCard]

class AnalysisService:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile", # High performance Groq model
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=ProblemCardList)


    async def extract_gaps(self, content_list: List[Dict]) -> List[ProblemCard]:
        """
        Processes a list of documents (papers/threads) and extracts actionable gaps.
        """
        if not content_list:
            return []

        prompt = ChatPromptTemplate.from_template(
            "You are a Senior Research Analyst. Analyze the following content sources and identify the most significant UNSOLVED PROBLEMS or LIMITATIONS mentioned.\n"
            "Focus on 'future work' sections, 'limitations' mentioned by authors, or 'unsolved bugs/challenges' discussed in technical threads.\n"
            "\n"
            "Format the output as a list of Problem Cards.\n"
            "\n"
            "{format_instructions}\n"
            "\n"
            "SOURCES:\n"
            "{sources}\n"
        )

        # Concatenate source summaries for analysis
        sources_text = ""
        for i, source in enumerate(content_list):
            sources_text += f"\n--- Source {i+1} ---\n"
            sources_text += f"Title: {source.get('title')}\n"
            sources_text += f"Content Snippet: {source.get('summary') or source.get('text')}\n"

        # Note: In a real production app, we would batch this or use a MapReduce chain if content is huge.
        # For the hackathon, we'll process the combined snippets if they fit in context.
        
        try:
            messages = prompt.format_messages(
                format_instructions=self.parser.get_format_instructions(),
                sources=sources_text
            )
            
            # Since we want a list of cards, we need to adjust the prompt or iterate.
            # For simplicity, we'll ask for one high-quality card per important gap found.
            response = self.llm.invoke(messages)
            parsed_result = self.parser.parse(response.content)
            return parsed_result.cards
        except Exception as e:
            print(f"Error in LLM analysis: {e}")
            return []

analysis_service = AnalysisService()
