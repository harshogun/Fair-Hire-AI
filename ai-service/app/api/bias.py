"""
Bias Detection & Inclusive Rewrite API Router
---------------------------------------------
Exposes endpoints for job description bias analysis and automated inclusive rewrites.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.bias_service import analyze_bias, rewrite_inclusive

router = APIRouter(tags=["Bias Detection & Inclusive Rewriting"])


class BiasAnalysisRequest(BaseModel):
    text: Optional[str] = Field(None, description="Job description or requirement text to analyze")
    jd_text: Optional[str] = Field(None, description="Alternative field name for job description text")


class BiasRewriteRequest(BaseModel):
    text: Optional[str] = Field(None, description="Job description text to rewrite")
    jd_text: Optional[str] = Field(None, description="Alternative field name for job description text")


@router.post("/api/bias/analyze", response_model=Dict[str, Any])
@router.post("/api/v1/bias/analyze", response_model=Dict[str, Any])
async def analyze_job_description_bias(request: BiasAnalysisRequest):
    """
    Analyze job description across gendered language, age bias, and readability dimensions.
    Returns comprehensive bias breakdown, scores, and flagged terms.
    """
    text = request.text or request.jd_text
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'text' or 'jd_text' field is required and cannot be empty."
        )
    return analyze_bias(text)


@router.post("/api/bias/rewrite", response_model=Dict[str, Any])
@router.post("/api/v1/bias/rewrite", response_model=Dict[str, Any])
async def rewrite_job_description_inclusive(request: BiasRewriteRequest):
    """
    Generate an inclusive rewrite of the job description, substituting flagged terms
    with evidence-backed neutral alternatives. Includes diff change-log.
    """
    text = request.text or request.jd_text
    if not text or not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'text' or 'jd_text' field is required and cannot be empty."
        )
    return rewrite_inclusive(text)
