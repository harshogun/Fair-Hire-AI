import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_matching_score_endpoint():
    payload = {
        "jd_text": "Senior Python developer proficient in Django, PostgreSQL, Docker, and REST APIs.",
        "resume_text": "Python engineer with 5 years experience building scalable backend microservices with Django and PostgreSQL.",
        "jd_skills": ["Python", "Django", "PostgreSQL", "Docker"],
        "resume_skills": ["Python", "Django", "PostgreSQL"]
    }
    response = client.post("/api/matching/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "semantic_score" in data
    assert data["semantic_score"] > 0.3
    assert data["keyword_score"] == 0.75  # 3 of 4 skills matched
    assert data["overall_score"] > 0
    assert data["status"] == "SUCCESS"


def test_matching_score_empty_fails():
    response = client.post("/api/matching/score", json={"jd_text": "", "resume_text": ""})
    assert response.status_code == 400
