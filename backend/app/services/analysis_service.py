import os
from typing import List, Dict, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

class ProblemCard(BaseModel):
    gap: str = Field(description="The specific research or implementation gap identified from the provided sources.")
    context: str = Field(description="Background information and why this gap is important, referencing specific findings from the provided papers/discussions.")
    source_citation: str = Field(description="The EXACT title of the source paper or discussion this gap was extracted from. Must be copied verbatim from the SOURCES list provided.")
    source_url: str = Field(default="", description="The URL of the source paper or discussion. Must be copied verbatim from the SOURCES list provided.")
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

    async def extract_gaps(self, content_list: List[Dict], domain: str = "", feedback: Optional[Dict] = None) -> List[ProblemCard]:
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
            "You are a Senior Research Analyst. The user is researching the domain: '{domain}'.\n"
            "You are given REAL research papers and technical discussions below.\n"
            "Your job is to identify UNSOLVED PROBLEMS, LIMITATIONS, or OPEN QUESTIONS explicitly mentioned in these sources\n"
            "that are DIRECTLY RELEVANT to '{domain}'.\n"
            "\n"
            "CRITICAL RULES:\n"
            "1. ONLY extract gaps that are EXPLICITLY mentioned in the provided sources (e.g. in 'future work', 'limitations', or open questions).\n"
            "2. Every gap MUST be directly related to '{domain}'. Discard any source or gap that is not clearly about this domain.\n"
            "   For example, if the domain is 'heart attacks', ignore sources about cybersecurity attacks, DDoS, or software issues.\n"
            "3. The 'source_citation' field MUST be the EXACT title of one of the sources below — do NOT invent or hallucinate paper titles.\n"
            "4. The 'source_url' field MUST be the EXACT URL from the source below — do NOT make up URLs.\n"
            "5. The 'context' field must reference specific findings or statements from that source.\n"
            "6. Do NOT generate generic gaps. Every gap must be traceable to a specific source below.\n"
            "7. If a source has no clear gap or limitation, OR is not relevant to '{domain}', skip it entirely.\n"
            "8. If none of the sources are relevant to '{domain}', return an EMPTY list of cards.\n"
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
            source_url = source.get('url') or source.get('link') or ''
            if source_url:
                sources_text += f"URL: {source_url}\n"
            source_id = source.get('id', '')
            if source_id and 'arxiv' in str(source_id):
                sources_text += f"arXiv ID: {source_id}\n"
            authors = source.get('authors', [])
            if authors:
                sources_text += f"Authors: {', '.join(authors[:5])}\n"
            sources_text += f"Content: {source.get('summary') or source.get('text') or source.get('body_snippet', '')}\n"

        try:
            messages = prompt.format_messages(
                domain=domain or "general",
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
