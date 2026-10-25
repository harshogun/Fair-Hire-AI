"""
Job Description Bias Detection & Inclusive Rewrite Service
---------------------------------------------------------
Analyzes job descriptions across multiple bias dimensions:
  1. Gendered language (masculine-coded / feminine-coded)
  2. Age-coded language (exclusionary wording based on age brackets)
  3. Readability (Flesch Reading Ease score)
Generates inclusive rewrites with detailed change logs.
"""

import re
from app.core.config import (
    MASCULINE_CODED_WORDS,
    FEMININE_CODED_WORDS,
    AGE_CODED_WORDS,
)


def _find_flags(text: str, word_bank: dict) -> list:
    text_lower = text.lower()
    flags = []
    for word in word_bank:
        pattern = r"(?<![a-zA-Z])" + re.escape(word) + r"(?![a-zA-Z])"
        for m in re.finditer(pattern, text_lower):
            start = max(0, m.start() - 30)
            end = min(len(text), m.end() + 30)
            flags.append({
                "word": word,
                "context": "..." + text[start:end].strip() + "...",
            })
    return flags


def analyze_gender_bias(jd_text: str) -> dict:
    """Masculine vs. feminine coded language -> bias score + lean."""
    masc_flags = _find_flags(jd_text, MASCULINE_CODED_WORDS)
    fem_flags = _find_flags(jd_text, FEMININE_CODED_WORDS)

    masc_count = len(masc_flags)
    fem_count = len(fem_flags)
    total = masc_count + fem_count

    if total == 0:
        lean = "balanced / neutral"
        bias_score = 0.0
    else:
        raw_lean = (fem_count - masc_count) / total
        bias_score = round(abs(raw_lean), 4)
        if raw_lean > 0.15:
            lean = "feminine-skewed"
        elif raw_lean < -0.15:
            lean = "masculine-skewed"
        else:
            lean = "balanced / neutral"

    return {
        "bias_score": bias_score,
        "gender_bias_score": bias_score,
        "lean": lean,
        "masculine_flags": masc_flags,
        "feminine_flags": fem_flags,
        "total_flagged_terms": total,
    }


def analyze_age_bias(jd_text: str) -> dict:
    """Age-coded wording -> flagged terms + a 0-1 severity score."""
    flags = _find_flags(jd_text, AGE_CODED_WORDS)
    word_count = max(1, len(jd_text.split()))
    severity = round(min(1.0, len(flags) / (word_count / 40.0)), 4)
    return {
        "age_bias_score": severity,
        "flags": flags,
        "total_flagged_terms": len(flags),
    }


def _count_syllables(word: str) -> int:
    word = word.lower().strip(".,!?;:")
    if not word:
        return 0
    vowels = "aeiouy"
    count = 0
    prev_was_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_was_vowel:
            count += 1
        prev_was_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def compute_readability(jd_text: str) -> dict:
    """
    Flesch Reading Ease:
        206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
    """
    sentences = re.split(r"[.!?]+", jd_text)
    sentences = [s for s in sentences if s.strip()]
    words = re.findall(r"[A-Za-z']+", jd_text)

    if not sentences or not words:
        return {"flesch_score": 60.0, "level": "moderate"}

    syllables = sum(_count_syllables(w) for w in words)
    score = 206.835 - 1.015 * (len(words) / len(sentences)) - 84.6 * (syllables / len(words))
    score = round(score, 1)

    if score >= 70:
        level = "easy to read"
    elif score >= 50:
        level = "moderate"
    else:
        level = "difficult to read"

    return {"flesch_score": score, "level": level}


def analyze_bias(jd_text: str) -> dict:
    """
    Full multi-dimensional bias report for a job description.
    Structures response for both Spring Boot JobService and frontend Bias Dashboard.
    """
    if not jd_text or not jd_text.strip():
        return {
            "bias_score": 0.0,
            "bias_level": "low",
            "gender_bias_score": 0.0,
            "age_bias_score": 0.0,
            "flesch_reading_ease": 60.0,
            "lean": "balanced / neutral",
            "masculine_flags": [],
            "feminine_flags": [],
            "total_flagged_terms": 0,
            "readability": {"flesch_score": 60.0, "level": "moderate"},
            "flagged_words": [],
        }

    gender = analyze_gender_bias(jd_text)
    age = analyze_age_bias(jd_text)
    readability = compute_readability(jd_text)

    # Compile unified flagged_words list for Spring Boot JobService rewrite suggestions
    flagged_words = []
    seen_words = set()

    for item in gender["masculine_flags"]:
        w = item["word"]
        if w not in seen_words:
            seen_words.add(w)
            suggestions = MASCULINE_CODED_WORDS.get(w, ["collaborative"])
            flagged_words.append({
                "word": w,
                "category": "GENDER_MASCULINE",
                "suggestions": suggestions[0] if suggestions else "neutral alternative",
                "context": item["context"],
            })

    for item in gender["feminine_flags"]:
        w = item["word"]
        if w not in seen_words:
            seen_words.add(w)
            suggestions = FEMININE_CODED_WORDS.get(w, ["goal-oriented"])
            flagged_words.append({
                "word": w,
                "category": "GENDER_FEMININE",
                "suggestions": suggestions[0] if suggestions else "neutral alternative",
                "context": item["context"],
            })

    for item in age["flags"]:
        w = item["word"]
        if w not in seen_words:
            seen_words.add(w)
            suggestions = AGE_CODED_WORDS.get(w, ["experienced candidate"])
            flagged_words.append({
                "word": w,
                "category": "AGE_EXCLUSIONARY",
                "suggestions": suggestions[0] if suggestions else "relevant candidate",
                "context": item["context"],
            })

    # Overall bias score composite
    overall_score = round(min(1.0, (gender["bias_score"] * 0.6) + (age["age_bias_score"] * 0.4)), 4)
    if overall_score > 0.4:
        bias_level = "high"
    elif overall_score > 0.15:
        bias_level = "medium"
    else:
        bias_level = "low"

    return {
        "bias_score": overall_score,
        "bias_level": bias_level,
        "gender_bias_score": gender["bias_score"],
        "age_bias_score": age["age_bias_score"],
        "flesch_reading_ease": readability["flesch_score"],
        "lean": gender["lean"],
        "masculine_flags": gender["masculine_flags"],
        "feminine_flags": gender["feminine_flags"],
        "total_flagged_terms": len(flagged_words),
        "gender_bias": gender,
        "age_bias": age,
        "readability": readability,
        "flagged_words": flagged_words,
    }


def _fix_articles(text: str) -> str:
    def fix_an(m):
        art = "A" if m.group(1)[0].isupper() else "a"
        return f"{art} {m.group(2)}"

    def fix_a(m):
        art = "An" if m.group(1)[0].isupper() else "an"
        return f"{art} {m.group(2)}"

    text = re.sub(r"\b(an)\s+([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z]\w*)", fix_an, text, flags=re.IGNORECASE)
    text = re.sub(r"\b(a)\s+([aeioAEIO]\w*)", fix_a, text, flags=re.IGNORECASE)
    return text


def rewrite_inclusive(jd_text: str) -> dict:
    """
    Produce an inclusive rewritten version with flagged words replaced.
    Returns changes list with before/after diffs, category, and score reductions.
    """
    if not jd_text:
        return {
            "original_text": "",
            "rewritten_text": "",
            "changes": [],
            "replacements": [],
            "bias_score_before": 0.0,
            "bias_score_after": 0.0,
            "bias_reduction": "0%",
            "total_replacements": 0,
        }

    changes = []
    new_text = jd_text

    for bank in (MASCULINE_CODED_WORDS, FEMININE_CODED_WORDS, AGE_CODED_WORDS):
        for word, replacements in bank.items():
            pattern = re.compile(
                r"(?<![a-zA-Z])" + re.escape(word) + r"(?![a-zA-Z])",
                re.IGNORECASE
            )
            if pattern.search(new_text):
                replacement = replacements[0]
                new_text, n = pattern.subn(replacement, new_text)
                if n:
                    if bank is MASCULINE_CODED_WORDS:
                        cat = "GENDER_MASCULINE"
                    elif bank is FEMININE_CODED_WORDS:
                        cat = "GENDER_FEMININE"
                    else:
                        cat = "AGE_EXCLUSIONARY"
                    changes.append({"from": word, "to": replacement, "count": n, "category": cat})

    if changes:
        new_text = _fix_articles(new_text)

    # Compute bias scores before and after rewrite
    before_analysis = analyze_bias(jd_text)
    after_analysis = analyze_bias(new_text)

    score_before = float(before_analysis.get("bias_score", 0.0))
    score_after = float(after_analysis.get("bias_score", 0.0))

    if score_before > 0:
        red_pct = round(((score_before - score_after) / score_before) * 100)
        reduction_str = f"{max(0, red_pct)}%"
    elif len(changes) > 0:
        reduction_str = "100%"
    else:
        reduction_str = "0%"

    return {
        "original_text": jd_text,
        "rewritten_text": new_text,
        "changes": changes,
        "replacements": changes,
        "bias_score_before": round(score_before, 2),
        "bias_score_after": round(score_after, 2),
        "bias_reduction": reduction_str,
        "total_replacements": sum(c.get("count", 1) for c in changes),
    }
