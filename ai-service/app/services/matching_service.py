"""
Candidate-Job Matching & Semantic Similarity Engine
---------------------------------------------------
Implements multi-strategy matching:
  1. keyword_score: Fraction of required skills in resume
  2. skill_jaccard: Jaccard similarity across skill sets
  3. semantic_score: Sentence-BERT embedding cosine similarity
     (with graceful fallback to TF-IDF cosine similarity)
"""

from typing import List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_SBERT_MODEL = None
_SBERT_AVAILABLE = None  # None = uninitialized


def _try_load_sbert():
    """Lazily load Sentence-BERT model once. Cached."""
    global _SBERT_MODEL, _SBERT_AVAILABLE
    if _SBERT_AVAILABLE is not None:
        return _SBERT_AVAILABLE

    try:
        from sentence_transformers import SentenceTransformer
        _SBERT_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        _SBERT_AVAILABLE = True
    except Exception as e:
        # Fallback to TF-IDF when offline or dependencies unavailable
        _SBERT_AVAILABLE = False
    return _SBERT_AVAILABLE


def tfidf_score(text_a: str, text_b: str) -> float:
    """TF-IDF cosine similarity between two texts -> float in [0.0, 1.0]."""
    if not text_a or not text_a.strip() or not text_b or not text_b.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf = vectorizer.fit_transform([text_a, text_b])
    except ValueError:
        return 0.0
    sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    return round(max(0.0, float(sim)), 4)


def keyword_score(jd_skills: List[str], resume_skills: List[str]) -> float:
    """Fraction of JD-required skills found in resume."""
    if not jd_skills:
        return 0.0
    jd_set = {s.lower() for s in jd_skills}
    resume_set = {s.lower() for s in resume_skills}
    overlap = jd_set & resume_set
    return round(len(overlap) / float(len(jd_set)), 4)


def skill_jaccard(jd_skills: List[str], resume_skills: List[str]) -> float:
    """Jaccard similarity between JD and resume skills."""
    jd_set = {s.lower() for s in jd_skills}
    resume_set = {s.lower() for s in resume_skills}
    if not jd_set and not resume_set:
        return 0.0
    union = jd_set | resume_set
    if not union:
        return 0.0
    return round(len(jd_set & resume_set) / float(len(union)), 4)


def semantic_score(jd_text: str, resume_text: str) -> Tuple[float, str]:
    """
    Compute sentence-embedding cosine similarity using Sentence-BERT,
    falling back to TF-IDF cosine similarity if SBERT is unavailable.
    """
    if not jd_text or not jd_text.strip() or not resume_text or not resume_text.strip():
        return 0.0, "empty-input"

    if _try_load_sbert():
        try:
            embeddings = _SBERT_MODEL.encode([jd_text, resume_text])
            sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return round(max(0.0, float(sim)), 4), "sentence-bert (all-MiniLM-L6-v2)"
        except Exception:
            pass

    return tfidf_score(jd_text, resume_text), "tfidf-fallback"


def compute_matching_score(
    jd_text: str,
    resume_text: str,
    jd_skills: Optional[List[str]] = None,
    resume_skills: Optional[List[str]] = None
) -> dict:
    """
    Comprehensive candidate-to-job matching score.
    Returns semantic_score, keyword_score, skill_jaccard, and composite score.
    """
    jd_skills = jd_skills or []
    resume_skills = resume_skills or []

    sem_score, backend = semantic_score(jd_text, resume_text)
    kw_score = keyword_score(jd_skills, resume_skills)
    jaccard = skill_jaccard(jd_skills, resume_skills)

    # If explicit skills were provided, composite blends semantic and keyword;
    # otherwise semantic similarity is the primary score.
    if jd_skills:
        composite = round(0.5 * sem_score + 0.5 * kw_score, 4)
    else:
        composite = sem_score

    return {
        "semantic_score": sem_score,
        "similarity_score": sem_score,
        "keyword_score": kw_score,
        "skill_jaccard": jaccard,
        "overall_score": round(composite * 100.0, 2),
        "backend": backend,
        "status": "SUCCESS"
    }
