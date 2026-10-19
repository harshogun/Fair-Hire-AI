import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_anonymize_endpoint():
    resume = "John Doe is an experienced software engineer. He graduated from MIT. Email: john.doe@example.com, Phone: 555-123-4567. Gender: Male."
    response = client.post("/api/anonymize", json={"resume_text": resume, "candidate_name": "John Doe"})
    assert response.status_code == 200
    data = response.json()
    assert "anonymized_text" in data
    anon = data["anonymized_text"]
    assert "John Doe" not in anon
    assert "[CANDIDATE]" in anon
    assert "john.doe@example.com" not in anon
    assert "[EMAIL_REDACTED]" in anon
    assert "Gender: Male" not in anon
