from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .user_schema import UserProfileForMatching


class GroupProfileForMatching(BaseModel):
    id: str
    name: str
    interests: List[str] = []
    group_type: str = "LOCAL"  # LOCAL or ONLINE
    coordinates: Optional[List[float]] = None
    embedding: Optional[List[float]] = None
    max_members: int = 10
    reserved_members_count: int = 0


class UserMatchRequest(BaseModel):
    target_user: UserProfileForMatching
    candidates: List[UserProfileForMatching]
    weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = 70.0
    radius_km: Optional[float] = 10.0


class ScoredMatch(BaseModel):
    id: str
    name: str
    interest_score: float
    location_score: float
    activity_score: float
    preference_score: float
    overall_score: float
    is_compatible: bool


class UserMatchResponse(BaseModel):
    target_user_id: str
    total_candidates: int
    compatible_count: int
    matches: List[ScoredMatch]


class GroupMatchRequest(BaseModel):
    target_user: UserProfileForMatching
    candidate_groups: List[GroupProfileForMatching]
    weights: Optional[Dict[str, float]] = None
    threshold: Optional[float] = 70.0
    radius_km: Optional[float] = 10.0


class GroupMatchResponse(BaseModel):
    target_user_id: str
    total_groups: int
    best_match: Optional[ScoredMatch] = None
    compatible_groups: List[ScoredMatch]
