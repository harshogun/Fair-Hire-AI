import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_analyze_bias_endpoint_masculine_skew():
    jd = "We are seeking a rockstar, aggressive, and dominant engineer to lead and outperform the competition."
    response = client.post("/api/bias/analyze", json={"text": jd})
    assert response.status_code == 200
    data = response.json()
    assert "bias_score" in data
    assert data["gender_bias_score"] > 0
    assert data["lean"] == "masculine-skewed"
    assert len(data["masculine_flags"]) >= 3
    assert "flagged_words" in data
    assert any(fw["word"] in ["rockstar", "aggressive", "dominant"] for fw in data["flagged_words"])


def test_analyze_bias_endpoint_age_skew():
    jd = "Seeking a young, energetic digital native and recent graduate with high-energy."
    response = client.post("/api/bias/analyze", json={"text": jd})
    assert response.status_code == 200
    data = response.json()
    assert data["age_bias_score"] > 0
    assert len(data["age_bias"]["flags"]) >= 2


def test_rewrite_inclusive_endpoint():
    jd = "We need an aggressive rockstar to dominate market share and outperform rivals."
    response = client.post("/api/bias/rewrite", json={"text": jd})
    assert response.status_code == 200
    data = response.json()
    assert "rewritten_text" in data
    assert "changes" in data
    assert len(data["changes"]) >= 2
    assert "rockstar" not in data["rewritten_text"].lower()
