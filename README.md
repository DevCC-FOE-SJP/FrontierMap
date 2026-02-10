# FrontierMap 🌐

FrontierMap is a research discovery engine that maps the "knowledge frontier" by identifying unsolved problems, knowledge gaps, and future work directions from academic papers (Arxiv) and technical discussions.

## 🚀 Features

- **Frontier Scanning**: Search any domain and extract actionable "Problem Cards" containing specific research gaps and proposed directions.
- **Interactive Knowledge Graph**: Visualize how research gaps branch out from core technology domains using a dynamic 2D force graph.
- **Multi-Source Intelligence**: Aggregates data from **arXiv**, **Reddit**, **HackerNews**, and **StackExchange** for a holistic view of the "knowledge frontier."
- **Real-Time "Pulse" Check**: AI-driven community sentiment analysis to identify "hot" vs. "dead-end" research topics.
- **Research Metrics & Velocity**: Dashboard tracking paper submission trends, top authors, and field growth rates.
- **Personalized Recommendations**: Learns from user feedback (bookmarks/dismissals) to refine future gap extraction.
- **PDF Export**: Generate structured reports of discovered gaps and metrics for offline review.
- **AI-Powered Analysis**: Leverages **Groq (Llama 3.3)** for extreme-speed research gap extraction and synthesis.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Force Graph 2D, Framer Motion, Recharts, jsPDF.
- **Backend**: FastAPI, LangChain, Groq API (Llama 3), PRAW (Reddit API), Arxiv API, Motor (MongoDB).
- **Database**: MongoDB (Local/Cloud) for persistence, with a fallback to memory-only mode.
- **Optional**: Pinecone & OpenAI Embeddings for semantic document retrieval.

## 📥 Getting Started

Follow these steps to get FrontierMap running on your local machine.

### 1. Prerequisites
- **Node.js**: v18 or higher
- **Python**: 3.9 or higher
- **MongoDB** (Optional): Local installation or Atlas URI for data persistence.
- **API Keys**:
  - **Groq API Key**: (Mandatory) Get it from [Groq Console](https://console.groq.com/).
  - **Reddit API**: (Optional) For scanning technical subreddits.
  - **Pinecone/OpenAI**: (Optional) For advanced semantic search features.

### 2. Backend Setup

The backend is a FastAPI service that handles research gap extraction and data processing.

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your keys:
   - `GROQ_API_KEY`: (Required) Your Groq API key.
   - `MONGODB_URL`: (Optional) Defaults to `mongodb://localhost:27017`.
   - `DATABASE_NAME`: (Optional) Defaults to `FrontierMap`.
   - *Note: If MongoDB is not running, the app will still work but won't save data.*

5. **Start the Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8001
   ```
   The backend will be available at `http://localhost:8001`.

### 3. Frontend Setup

The frontend is a React application built with Vite.

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify API Configuration**:
   Ensure `frontend/src/services/api.js` points to your backend URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:8001';
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will usually be available at `http://localhost:5173`.

## 📂 Project Structure

```text
FrontierMap/
├── frontend/               # React Application (Vite)
│   ├── src/
│   │   ├── components/     # UI Components (Cards, Graph, Metrics)
│   │   ├── pages/          # Explorer, Dashboard, Saved Items
│   │   ├── services/       # API integration layer
│   │   └── styles/         # Global CSS and themes
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Route definitions
│   │   ├── core/           # Configuration, Database connections
│   │   └── services/       # Business logic (Arxiv, LLM, Reddit)
│   ├── tests/              # Pytest suite
│   └── requirements.txt    # Python dependencies
```

## Team members - DevCC

- Sithum Sandaruwan
- Lochana Bandara
- Vimarshana Herath
- Nuwan Weerasuriya
- Himeth Udana

## ⚖️ License
MIT
