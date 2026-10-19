"""
Semantic & Keyword Matching API Router
---------------------------------------
Exposes endpoints for computing transformer-based semantic similarity and skill overlap scores.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.matching_service import compute_matching_score

router = APIRouter(tags=["Candidate Matching & Semantic Similarity"])


class MatchingScoreRequest(BaseModel):
    jd_text: str = Field(..., description="Job description or requirement text")
    resume_text: str = Field(..., description="Candidate resume text")
    jd_skills: Optional[List[str]] = Field(default_factory=list, description="List of required skills from JD")
    resume_skills: Optional[List[str]] = Field(default_factory=list, description="List of skills extracted from resume")


@router.post("/api/matching/score", response_model=Dict[str, Any])
@router.post("/api/v1/matching/score", response_model=Dict[str, Any])
async def compute_score(request: MatchingScoreRequest):
    """
    Compute semantic embedding similarity and skill overlap score between JD and resume.
    """
    if not request.jd_text or not request.jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'jd_text' field is required."
        )
    if not request.resume_text or not request.resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'resume_text' field is required."
        )

    return compute_matching_score(
        jd_text=request.jd_text,
        resume_text=request.resume_text,
        jd_skills=request.jd_skills,
        resume_skills=request.resume_skills
    )
