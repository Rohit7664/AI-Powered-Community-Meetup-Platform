import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.embeddings.embedding_service import generate_embeddings
from app.services.similarity_service import (
    cosine_similarity,
    haversine_distance_km,
    calculate_location_score,
)
from app.matching.score_calculator import compute_weighted_overall_score

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "InterestHub AI Service"


def test_semantic_matching():
    """Test Case 7 from Master Prompt: Semantic matching of similar descriptions."""
    text_a = "I enjoy travelling and exploring mountains"
    text_b = "I love hiking and adventure trips"
    text_unrelated = "Advanced quantum computing algorithms in compiler design"

    embeddings = generate_embeddings([text_a, text_b, text_unrelated])
    assert len(embeddings) == 3
    assert len(embeddings[0]) == 384

    sim_related = cosine_similarity(embeddings[0], embeddings[1])
    sim_unrelated = cosine_similarity(embeddings[0], embeddings[2])

    print(f"Related similarity: {sim_related}, Unrelated similarity: {sim_unrelated}")
    assert sim_related > sim_unrelated


def test_location_compatibility():
    """Test Case 8 from Master Prompt: Users within 10km radius."""
    # Delhi Connaught Place to India Gate ~ 2.5 km
    cp = [77.2167, 28.6328]
    india_gate = [77.2295, 28.6129]
    dist = haversine_distance_km(cp, india_gate)
    assert dist < 5.0

    score = calculate_location_score(cp, india_gate, radius_km=10.0)
    assert score >= 70.0  # Within 10km should qualify with high score

    # Far away (Delhi to Mumbai ~ 1150 km)
    mumbai = [72.8777, 19.0760]
    far_score = calculate_location_score(cp, mumbai, radius_km=10.0, is_online=False)
    assert far_score < 40.0

    # Online mode should score 100 regardless of distance
    online_score = calculate_location_score(cp, mumbai, radius_km=10.0, is_online=True)
    assert online_score == 100.0


def test_weighted_formula():
    """Verify Master Prompt Formula weights."""
    # Overall = Interest*0.50 + Location*0.20 + Activity*0.15 + Preference*0.15
    score = compute_weighted_overall_score(
        interest_sim=1.0,  # 100 * 0.50 = 50
        location_score=100.0,  # 100 * 0.20 = 20
        activity_score=100.0,  # 100 * 0.15 = 15
        preference_score=100.0,  # 100 * 0.15 = 15
    )
    assert score == 100.0


def test_embeddings_api():
    response = client.post(
        "/ai/embeddings",
        json={"texts": ["Cricket and Travelling", "Photography and Hiking"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "embeddings" in data
    assert len(data["embeddings"]) == 2
    assert len(data["embeddings"][0]) == 384


def test_user_matching_api():
    payload = {
        "target_user": {
            "id": "user_1",
            "name": "Rahul",
            "interests": ["Cricket", "Travelling", "Photography"],
            "coordinates": [77.2090, 28.6139],
            "preferences": {
                "activityTypes": ["Outdoor activities", "Weekend activities"],
                "indoorOutdoor": "Outdoor",
                "allowOnline": True,
            },
        },
        "candidates": [
            {
                "id": "user_2",
                "name": "Aman",
                "interests": ["Cricket", "Travelling", "Adventure"],
                "coordinates": [77.2200, 28.6200],
                "preferences": {
                    "activityTypes": ["Outdoor activities", "Weekend activities"],
                    "indoorOutdoor": "Outdoor",
                    "allowOnline": True,
                },
            },
            {
                "id": "user_3",
                "name": "Priya",
                "interests": ["Cricket", "Travelling", "Photography"],
                "coordinates": [77.2150, 28.6180],
                "preferences": {
                    "activityTypes": ["Outdoor activities"],
                    "indoorOutdoor": "Outdoor",
                    "allowOnline": True,
                },
            },
        ],
        "threshold": 70.0,
        "radius_km": 10.0,
    }

    response = client.post("/ai/match/users", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_candidates"] == 2
    assert data["compatible_count"] == 2
    assert data["matches"][0]["overall_score"] >= 70.0
