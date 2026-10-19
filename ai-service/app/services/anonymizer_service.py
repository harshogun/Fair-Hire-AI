"""
Blind Screening & Resume Anonymizer Service
-------------------------------------------
Produces an anonymized version of a resume by stripping candidate names,
gendered pronouns/titles, contact details, and explicit identity fields.
Enables fair, identity-sanitized blind screening.
"""

import re
from typing import Tuple, List
from app.core.config import GENDER_PRONOUNS, IDENTITY_FIELDS_TO_STRIP


def anonymize_resume(resume_text: str, candidate_name: str = "") -> Tuple[str, List[str]]:
    """
    Returns (anonymized_text, list_of_redactions).
    Strips name, gendered pronouns, emails, phone numbers, and identity field lines.
    """
    if not resume_text:
        return "", []

    text = resume_text
    redactions = []

    # 1. Remove candidate name wherever it appears
    if candidate_name and candidate_name.strip() and candidate_name.strip() != "Unknown Candidate":
        name_pattern = re.compile(re.escape(candidate_name.strip()), re.IGNORECASE)
        if name_pattern.search(text):
            text = name_pattern.sub("[CANDIDATE]", text)
            redactions.append(f"Name '{candidate_name.strip()}' -> [CANDIDATE]")

    # 2. Neutralize gendered pronouns / titles
    for word, neutral in GENDER_PRONOUNS.items():
        pattern = re.compile(r"(?<![a-zA-Z])" + re.escape(word) + r"(?![a-zA-Z])", re.IGNORECASE)
        if pattern.search(text):
            text, n = pattern.subn(neutral, text)
            if n:
                redactions.append(f"'{word}' -> '{neutral}' ({n}x)")

    # 3. Redact Email addresses
    email_pattern = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
    if email_pattern.search(text):
        text, n = email_pattern.subn("[EMAIL_REDACTED]", text)
        if n:
            redactions.append(f"Redacted {n} email address(es)")

    # 4. Redact Phone numbers
    phone_pattern = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
    if phone_pattern.search(text):
        text, n = phone_pattern.subn("[PHONE_REDACTED]", text)
        if n:
            redactions.append(f"Redacted {n} phone number(s)")

    # 5. Strip explicit identity field lines (e.g., "Gender: Female")
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        stripped_line = line.strip().lower()
        if any(stripped_line.startswith(field + ":") for field in IDENTITY_FIELDS_TO_STRIP):
            redactions.append(f"Removed identity field line: '{line.strip()}'")
            continue
        cleaned_lines.append(line)

    return "\n".join(cleaned_lines), redactions
