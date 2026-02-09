from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.discovery import router as discovery_router
from .core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_db()
    yield
    await db.close_db()

app = FastAPI(title="FrontierMap API", version="0.1.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(discovery_router)

@app.get("/")
async def root():
    return {"message": "Welcome to FrontierMap API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
