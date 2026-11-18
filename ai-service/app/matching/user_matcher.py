from typing import List
from ..schemas.user_schema import UserProfileForMatching
from ..schemas.matching_schema import UserMatchRequest, UserMatchResponse, ScoredMatch
from ..services.similarity_service import cosine_similarity, calculate_location_score
from ..embeddings.embedding_service import generate_embeddings
from .score_calculator import (
    calculate_activity_score,
    calculate_preference_score,
    compute_weighted_overall_score,
)


def match_user_with_candidates(request: UserMatchRequest) -> UserMatchResponse:
    target = request.target_user
    threshold = request.threshold or 70.0
    radius_km = request.radius_km or 10.0

    # Ensure target has embedding
    if not target.embedding:
        interest_text = " ".join(target.interests + target.custom_interests + [target.bio or ""])
        target.embedding = generate_embeddings([interest_text])[0]

    scored_matches: List[ScoredMatch] = []

    for candidate in request.candidates:
        if not candidate.embedding:
            cand_text = " ".join(candidate.interests + candidate.custom_interests + [candidate.bio or ""])
            candidate.embedding = generate_embeddings([cand_text])[0]

        # 1. Interest cosine similarity
        interest_sim = cosine_similarity(target.embedding, candidate.embedding)
        raw_interest_score = round(interest_sim * 100.0, 1)

        # 2. Location compatibility
        is_online = bool(
            target.preferences and target.preferences.get("allowOnline")
            and candidate.preferences and candidate.preferences.get("allowOnline")
        )
        loc_score = calculate_location_score(
            target.coordinates, candidate.coordinates, radius_km, is_online
        )

        # 3. Activity compatibility
        act_score = calculate_activity_score(target.preferences, candidate.preferences)

        # 4. Preference compatibility
        pref_score = calculate_preference_score(target.preferences, candidate.preferences)

        # Overall score
        overall = compute_weighted_overall_score(
            interest_sim, loc_score, act_score, pref_score, request.weights
        )

        is_compatible = overall >= threshold

        scored_matches.append(
            ScoredMatch(
                id=candidate.id,
                name=candidate.name or "User",
                interest_score=raw_interest_score,
                location_score=loc_score,
                activity_score=act_score,
                preference_score=pref_score,
                overall_score=overall,
                is_compatible=is_compatible,
            )
        )

    # Rank descending
    scored_matches.sort(key=lambda x: x.overall_score, reverse=True)
    compatible_count = sum(1 for m in scored_matches if m.is_compatible)

    return UserMatchResponse(
        target_user_id=target.id,
        total_candidates=len(request.candidates),
        compatible_count=compatible_count,
        matches=scored_matches,
    )
