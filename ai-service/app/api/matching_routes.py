from fastapi import APIRouter
from ..schemas.matching_schema import (
    UserMatchRequest,
    UserMatchResponse,
    GroupMatchRequest,
    GroupMatchResponse,
)
from ..matching.user_matcher import match_user_with_candidates
from ..matching.group_matcher import match_user_with_groups

router = APIRouter(prefix="/ai/match", tags=["Matching"])


@router.post("/users", response_model=UserMatchResponse)
async def match_users_endpoint(req: UserMatchRequest):
    return match_user_with_candidates(req)


@router.post("/groups", response_model=GroupMatchResponse)
async def match_groups_endpoint(req: GroupMatchRequest):
    return match_user_with_groups(req)
