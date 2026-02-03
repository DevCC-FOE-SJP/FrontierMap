# FrontierMap 🌐

FrontierMap is a research discovery engine that maps the "knowledge frontier" by identifying unsolved problems, knowledge gaps, and future work directions from academic papers (Arxiv) and technical discussions.

## 🚀 Features

- **Frontier Scanning**: Search any domain and extract actionable "Problem Cards" using AI.
- **Interactive Knowledge Graph**: Visualize how research gaps branch out from core domains.
- **AI-Powered Analysis**: Leverages **Groq (Llama 3.3)** for high-speed research gap extraction.
- **Multi-Source Discovery**: Integrates Arxiv papers and (optional) Reddit technical threads.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Force Graph 2D, Recharts.
- **Backend**: FastAPI, LangChain, Groq API, Arxiv API.
- **Optional**: OpenAI Embeddings, Pinecone (for semantic search).

## 📥 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Groq API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📂 Project Structure

```text
FrontierMap/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/     # Explorer, Graph, Metrics
│   │   └── services/  # API connectivity
├── backend/           # FastAPI Service
│   ├── app/
│   │   ├── api/       # Endpoints
│   │   └── services/  # AI and Data Logic
```

## ⚖️ License
MIT
