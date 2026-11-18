from fastapi import APIRouter, HTTPException
from ..schemas.user_schema import TextEmbeddingRequest, TextEmbeddingResponse
from ..embeddings.embedding_service import generate_embeddings, get_model_info

router = APIRouter(prefix="/ai", tags=["Embeddings"])


@router.post("/embeddings", response_model=TextEmbeddingResponse)
async def create_embeddings(req: TextEmbeddingRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="Text list cannot be empty")

    embeddings = generate_embeddings(req.texts)
    info = get_model_info()

    return TextEmbeddingResponse(
        model=info["model_name"],
        dimension=info["dimension"],
        embeddings=embeddings,
    )
