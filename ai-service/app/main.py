import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .embeddings.embedding_service import load_model, get_model_info
from .api.embedding_routes import router as embedding_router
from .api.matching_routes import router as matching_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(name)s: %(message)s",
)
logger = logging.getLogger("interesthub.ai")

MODEL_NAME = os.getenv("MODEL_NAME", "all-MiniLM-L6-v2")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model once
    logger.info(f"Initializing AI Service with model {MODEL_NAME}...")
    load_model(MODEL_NAME)
    logger.info("AI Service model initialization complete.")
    yield
    # Shutdown
    logger.info("AI Service shutting down.")


app = FastAPI(
    title="InterestHub AI Microservice",
    description="Semantic interest matching engine powered by Sentence Transformers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(embedding_router)
app.include_router(matching_router)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "InterestHub AI Service",
        "model_info": get_model_info(),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
