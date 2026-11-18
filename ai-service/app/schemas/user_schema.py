from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TextEmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., description="List of raw interest descriptions to embed")


class TextEmbeddingResponse(BaseModel):
    model: str
    dimension: int
    embeddings: List[List[float]]


class UserProfileForMatching(BaseModel):
    id: str
    name: Optional[str] = ""
    interests: List[str] = []
    custom_interests: List[str] = []
    bio: Optional[str] = ""
    coordinates: Optional[List[float]] = None  # [lng, lat]
    preferences: Optional[Dict[str, Any]] = None
    embedding: Optional[List[float]] = None
