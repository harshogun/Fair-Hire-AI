"""
Resume Anonymizer & Blind Screening API Router
----------------------------------------------
Exposes endpoints for redacting PII, gendered pronouns, and identity markers from resumes.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.anonymizer_service import anonymize_resume

router = APIRouter(tags=["Blind Screening & Anonymization"])


class AnonymizeRequest(BaseModel):
    resume_text: str = Field(..., description="Raw candidate resume text to anonymize")
    candidate_name: Optional[str] = Field("", description="Candidate's full name to redact")


@router.post("/api/anonymize", response_model=Dict[str, Any])
@router.post("/api/v1/anonymize", response_model=Dict[str, Any])
async def anonymize_candidate_resume(request: AnonymizeRequest):
    """
    Produce an identity-sanitized resume for blind screening.
    """
    if not request.resume_text or not request.resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The 'resume_text' field is required."
        )

    anonymized, redactions = anonymize_resume(
        resume_text=request.resume_text,
        candidate_name=request.candidate_name or ""
    )

    return {
        "original_text": request.resume_text,
        "anonymized_text": anonymized,
        "redactions": redactions,
        "total_redactions": len(redactions),
        "status": "SUCCESS"
    }
