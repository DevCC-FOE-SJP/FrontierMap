# FrontierMap 🌐

FrontierMap is a research discovery engine that maps the "knowledge frontier" by identifying unsolved problems, knowledge gaps, and future work directions from academic papers (Arxiv) and technical discussions.

## 🚀 Features

- **Frontier Scanning**: Search any domain and extract actionable "Problem Cards" using AI.
- **Interactive Knowledge Graph**: Visualize how research gaps branch out from core domains.
- **AI-Powered Analysis**: Leverages **Groq (Llama 3.3)** for high-speed research gap extraction.
- **Multi-Source Discovery**: Integrates Arxiv papers and (optional) Reddit technical threads.
- **Issue Tracking & Backlog Management**: Organize research gaps as trackable issues with status, priority, and tags.
- **Kanban Board**: Manage your research backlog with a visual kanban-style interface.
- **Advanced Filtering**: Filter and sort issues by status, priority, domain, and tags.

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
│   │   ├── pages/     # Explorer, Graph, Metrics, BacklogBoard
│   │   └── services/  # API connectivity
├── backend/           # FastAPI Service
│   ├── app/
│   │   ├── api/       # Endpoints
│   │   ├── core/      # Models, Database
│   │   └── services/  # AI and Data Logic
```

## 📋 Issue Tracking & Backlog Management

FrontierMap now includes comprehensive issue tracking features to help you manage research gaps as actionable items:

### Features

- **Status Tracking**: Track issues through workflow states (To Do, In Progress, Done, Blocked)
- **Priority Levels**: Assign priorities (Low, Medium, High, Critical) to focus on important gaps
- **Tags & Labels**: Organize issues with custom tags for better categorization
- **Kanban Board**: Visual board with columns for each status, drag-and-drop functionality
- **Advanced Filters**: Filter by status, priority, domain, or tags to find specific issues
- **Statistics Dashboard**: Overview of total issues and breakdown by status/priority

### API Endpoints

- `PUT /discovery/cards/{card_id}` - Update card metadata (status, priority, tags, assignee)
- `GET /discovery/cards/{card_id}` - Get a specific card by ID
- `DELETE /discovery/cards/{card_id}` - Delete a card from the backlog
- `GET /discovery/backlog/stats` - Get backlog statistics
- `GET /discovery/backlog/filter` - Get filtered cards by various criteria

### Usage

1. Navigate to **Issue Backlog** in the sidebar
2. View all saved problem cards organized by status
3. Click on status/priority dropdowns to update card metadata
4. Use filters to narrow down specific issues
5. Track progress with real-time statistics

## ⚖️ License
MIT
