import os
from typing import List, Dict, Optional
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
            model="llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=ProblemCardList)

    async def extract_gaps(self, content_list: List[Dict], feedback: Optional[Dict] = None) -> List[ProblemCard]:
        """
        Processes a list of documents (papers/threads) and extracts actionable gaps.
        Optionally uses user feedback to prioritize relevant directions.
        """
        if not content_list:
            return []

        feedback_section = ""
        if feedback:
            bookmarked = feedback.get("bookmarked", [])
            dismissed = feedback.get("dismissed", [])
            if bookmarked or dismissed:
                feedback_section = "\n\nUSER PREFERENCES (use these to prioritize similar directions):\n"
                if bookmarked:
                    feedback_section += f"Topics the user found interesting: {', '.join(bookmarked[:5])}\n"
                if dismissed:
                    feedback_section += f"Topics the user dismissed: {', '.join(dismissed[:5])}\n"
                feedback_section += "Prioritize gaps similar to the user's interests and avoid directions they've dismissed.\n"

        prompt = ChatPromptTemplate.from_template(
            "You are a Senior Research Analyst. Analyze the following content sources and identify the most significant UNSOLVED PROBLEMS or LIMITATIONS mentioned.\n"
            "Focus on 'future work' sections, 'limitations' mentioned by authors, or 'unsolved bugs/challenges' discussed in technical threads.\n"
            "\n"
            "Format the output as a list of Problem Cards.\n"
            "\n"
            "{format_instructions}\n"
            "{feedback}"
            "\n"
            "SOURCES:\n"
            "{sources}\n"
        )

        sources_text = ""
        for i, source in enumerate(content_list):
            sources_text += f"\n--- Source {i+1} ---\n"
            sources_text += f"Title: {source.get('title')}\n"
            sources_text += f"Content Snippet: {source.get('summary') or source.get('text')}\n"

        try:
            messages = prompt.format_messages(
                format_instructions=self.parser.get_format_instructions(),
                sources=sources_text,
                feedback=feedback_section,
            )
            
            response = self.llm.invoke(messages)
            parsed_result = self.parser.parse(response.content)
            return parsed_result.cards
        except Exception as e:
            print(f"Error in LLM analysis: {e}")
            return []

    async def generate_single_card(self, domain: str, sub_topic: str) -> Optional[ProblemCard]:
        """
        Generate a single ProblemCard for a given sub-topic using AI.
        Used when users want to explore a specific direction within their domain.
        """
        prompt = ChatPromptTemplate.from_template(
            "You are a Senior Research Analyst. Generate a detailed Problem Card for an unsolved research gap.\n"
            "\n"
            "Domain: {domain}\n"
            "Focus Area: {sub_topic}\n"
            "\n"
            "Create ONE high-quality Problem Card identifying the most important unsolved gap in this area.\n"
            "The card should include a specific gap, background context, a source citation (use a plausible arXiv or conference reference),\n"
            "a proposed solution direction, and a novelty score from 1-10.\n"
            "\n"
            "{format_instructions}\n"
        )

        single_parser = PydanticOutputParser(pydantic_object=ProblemCardList)
        
        try:
            messages = prompt.format_messages(
                domain=domain,
                sub_topic=sub_topic,
                format_instructions=single_parser.get_format_instructions(),
            )
            response = self.llm.invoke(messages)
            parsed_result = single_parser.parse(response.content)
            if parsed_result.cards:
                return parsed_result.cards[0]
            return None
        except Exception as e:
            print(f"Error generating single card: {e}")
            return None

analysis_service = AnalysisService()
