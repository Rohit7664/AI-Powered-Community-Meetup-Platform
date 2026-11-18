from typing import Dict, Any, Optional
from ..services.similarity_service import (
    cosine_similarity,
    calculate_location_score,
)

DEFAULT_WEIGHTS = {
    "interest": 0.50,
    "location": 0.20,
    "activity": 0.15,
    "preference": 0.15,
}


def calculate_activity_score(pref_a: Optional[Dict[str, Any]], pref_b: Optional[Dict[str, Any]]) -> float:
    if not pref_a or not pref_b:
        return 65.0
    acts_a = set(pref_a.get("activityTypes", []))
    acts_b = set(pref_b.get("activityTypes", []))

    if not acts_a or not acts_b:
        return 60.0

    intersection = acts_a.intersection(acts_b)
    union = acts_a.union(acts_b)
    if not union:
        return 50.0

    jaccard = len(intersection) / len(union)
    return round(jaccard * 100.0, 1)


def calculate_preference_score(pref_a: Optional[Dict[str, Any]], pref_b: Optional[Dict[str, Any]]) -> float:
    if not pref_a or not pref_b:
        return 70.0
    score = 70.0

    in_out_a = pref_a.get("indoorOutdoor")
    in_out_b = pref_b.get("indoorOutdoor")
    if in_out_a and in_out_b:
        if in_out_a == in_out_b or in_out_a == "Both" or in_out_b == "Both":
            score += 20.0
        else:
            score -= 30.0

    online_a = pref_a.get("allowOnline", True)
    online_b = pref_b.get("allowOnline", True)
    if online_a and online_b:
        score += 10.0

    return max(0.0, min(100.0, score))


def compute_weighted_overall_score(
    interest_sim: float,  # 0.0 to 1.0
    location_score: float,  # 0.0 to 100.0
    activity_score: float,  # 0.0 to 100.0
    preference_score: float,  # 0.0 to 100.0
    custom_weights: Optional[Dict[str, float]] = None,
) -> float:
    w = custom_weights or DEFAULT_WEIGHTS
    raw_interest = interest_sim * 100.0

    overall = (
        raw_interest * w.get("interest", 0.50)
        + location_score * w.get("location", 0.20)
        + activity_score * w.get("activity", 0.15)
        + preference_score * w.get("preference", 0.15)
    )
    return round(max(0.0, min(100.0, overall)), 1)
