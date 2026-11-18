from typing import List, Optional
from ..schemas.matching_schema import GroupMatchRequest, GroupMatchResponse, ScoredMatch
from ..services.similarity_service import cosine_similarity, calculate_location_score
from ..embeddings.embedding_service import generate_embeddings
from .score_calculator import compute_weighted_overall_score


def match_user_with_groups(request: GroupMatchRequest) -> GroupMatchResponse:
    target = request.target_user
    threshold = request.threshold or 70.0
    radius_km = request.radius_km or 10.0

    if not target.embedding:
        interest_text = " ".join(target.interests + target.custom_interests + [target.bio or ""])
        target.embedding = generate_embeddings([interest_text])[0]

    scored_groups: List[ScoredMatch] = []

    for group in request.candidate_groups:
        # Check capacity: group must have available seats (< max_members)
        if group.reserved_members_count >= group.max_members:
            continue

        if not group.embedding:
            group_text = f"{group.name} " + " ".join(group.interests)
            group.embedding = generate_embeddings([group_text])[0]

        # 1. Semantic Interest similarity
        interest_sim = cosine_similarity(target.embedding, group.embedding)
        raw_interest_score = round(interest_sim * 100.0, 1)

        # 2. Location score
        is_online = group.group_type.upper() == "ONLINE"
        loc_score = calculate_location_score(
            target.coordinates, group.coordinates, radius_km, is_online
        )

        act_score = 75.0
        pref_score = 80.0

        overall = compute_weighted_overall_score(
            interest_sim, loc_score, act_score, pref_score, request.weights
        )

        is_compatible = overall >= threshold

        scored_groups.append(
            ScoredMatch(
                id=group.id,
                name=group.name,
                interest_score=raw_interest_score,
                location_score=loc_score,
                activity_score=act_score,
                preference_score=pref_score,
                overall_score=overall,
                is_compatible=is_compatible,
            )
        )

    scored_groups.sort(key=lambda x: x.overall_score, reverse=True)
    compatible_groups = [g for g in scored_groups if g.is_compatible]
    best_match: Optional[ScoredMatch] = compatible_groups[0] if compatible_groups else None

    return GroupMatchResponse(
        target_user_id=target.id,
        total_groups=len(request.candidate_groups),
        best_match=best_match,
        compatible_groups=compatible_groups,
    )
