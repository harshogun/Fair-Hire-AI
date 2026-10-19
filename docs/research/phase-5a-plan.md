# FairHire AI — Phase 5A Dataset Foundation Plan
## Traceable, Privacy-Conscious, Reproducible Research Dataset Architecture

**Document ID:** `PLAN-PHASE-5A-DATASET-001`  
**Version:** `1.7.3-FINAL-GIT-SCANNER-AUDITED`  
**Status:** `PLANNING — HUMAN DECISIONS RECORDED (IMPLEMENTATION UNAUTHORIZED)`  
**Date:** October 2026  
**Authors:** FairHire AI Research & Architecture Team  
**Governing Context:** M.Sc. II (Computer Science) Research Project  
**Operational Mode:** **PLAN ONLY — STRICTLY NO IMPLEMENTATION**

---

> [!IMPORTANT]
> **Operational Boundary Notice (Phase 5A Planning Only):**  
> This document is strictly an architectural design, ethical governance framework, and operational plan for Phase 5A. In compliance with repository phase-gate governance, **no data collection, web scraping, resume harvesting, script authoring, schema file generation, database migrations, or matching engine modifications are authorized or executed during this planning task.** Architectural and policy decisions have been recorded as approved for planning, but Phase 5A implementation remains strictly **UNAUTHORIZED and ON HOLD** pending separate, explicit human authorization.

---

## 1. Executive Summary & Research Objectives

### 1.1 Context within FairHire AI
FairHire AI is an enterprise-grade recruitment and resume screening research framework engineered to investigate and mitigate algorithmic and cognitive bias in candidate evaluation. 

The preceding project phases established a deterministic, auditable software foundation:
- **Phase 3A:** Deterministic resume ingestion, structural validation, and multi-format text extraction (PDF, DOCX, TXT) with SHA-256 integrity tracking.
- **Phase 3B:** Deterministic canonical skill taxonomy and rule-based token extraction (V3 Flyway checksum `11453495`).
- **Phase 4 (4A–4E):** Deterministic job–candidate matching engine operating under method `CANONICAL_SKILL_COVERAGE`, algorithm version `deterministic-v1`, exact $80\%$ required / $20\%$ preferred mathematical weighting via `BigDecimal` (`RoundingMode.HALF_UP`), sanitized evidence spans, and zero opaque ML scoring.
- **Phase 4E Gate:** Production readiness, JWT security perimeter, tenant authorization, and real PostgreSQL 16 database verification (Migrations V1 through V5 intact; no V6).

Phase 5 transitions the system into empirical research evaluation. The core research objectives comprise:
1. **Resume Matching Evaluation:** Evaluating the precision, recall, and candidate rankings of keyword-based, canonical deterministic, and semantic matching systems.
2. **Job-Description Language Bias Analysis:** Auditing job descriptions for exclusionary, gender-coded, age-biased, and elitist terminology using grounded linguistic evidence.
3. **Blind-Screening Comparisons:** Quantifying whether scrubbing personally identifiable information (PII) and demographic proxy indicators shifts candidate rankings or mitigates disparate impact.
4. **Measurable Academic Findings:** Producing verifiable, reproducible empirical statistics suitable for peer-reviewed academic publication.

### 1.2 Phase 5A Purpose & Pilot Scope
A valid machine learning and NLP research study requires an unimpeachable data foundation. Phase 5A establishes the **Dataset Foundation**: the schema designs, collection protocols, privacy safeguards, normalization standards, and annotation guidelines necessary to build an auditable benchmark dataset.

The pilot targets for Phase 5A are:
- **30 Job Descriptions** (stratified across 25 domain-specific technical and 5 cross-functional roles from verified sources)
- **60 Resume Samples** (composed primarily of synthetic profiles with optional authorized donations, governed by strict fallback rules)
- **60 Evaluation Pairs** (exploratory candidate-job pairings with explicit pre-experimental hypotheses)
- **Double-Annotation Diagnostic Pilot** (at least 10 job descriptions, 10 resumes, and 20 evaluation pairs independently annotated by two annotators to evaluate guideline clarity)

> [!NOTE]
> **Pilot Nature & Statistical Disclaimer:**  
> The 30 JD, 60 resume, and 60 pair targets constitute an **initial exploratory pilot**, designed to calibrate guidelines, test tooling, and validate schema contracts. This pilot is **not** a statistically representative benchmark of broader employment markets, and findings must be reported with explicit statistical confidence limits.

### 1.3 Bound Claims on Synthetic Data
Synthetic candidate profiles serve an essential function in FairHire AI: they enable rigorous **structural, algorithmic, syntactic, and pipeline testing** without privacy risks or third-party copyright entanglements. However, the research plan explicitly acknowledges their epistemic limitations:
- **No Representativeness Claim:** Synthetic profiles do **not** establish demographic representativeness, ecological validity, or real-world behavioral validity.
- **No Labor Market Generalization:** Performance metrics observed on synthetic candidate profiles cannot be assumed to generalize directly to real-world applicant distributions without subsequent empirical validation.
- **Controlled Baseline Role:** Synthetic profiles function strictly as standardized probes to evaluate how matching algorithms respond to controlled variations in skill sets and formatting.

### 1.4 In-Scope Boundaries
- Formal data dictionary and versioned JSON Schema specifications for all dataset artifacts (including distinct adjudication records).
- Multi-tier source provenance, copyright inspection, and defensible usage evaluation protocols with inclusion-blocking rules and approval compatibility constraints.
- Multi-tier privacy protection, PII minimization, explicit resume release eligibility tiers, verified active storage deletion, backup lifecycle policies, and linkability mitigations.
- Deterministic text normalization, canonical Python Unicode code-point offset validation, and duplicate detection algorithms.
- Structured annotation guidelines for required/preferred skills and exclusionary language categories.
- Inter-annotator agreement (IAA) diagnostic metrics, discrepancy confusion reporting, and adjudication procedures.
- Reproducible evaluation-pair sampling protocol decoupling pre-experimental hypotheses from ground truth and production matcher scores.
- Comprehensive schema contract verification plan and test matrix distinguishing local JSON Schema validation from cross-record relational validation.
- Repository safety architecture, staged-file pre-commit checks, and CI security boundary enforcement.
- Quality assurance gate distinguishing mandatory non-negotiables from diagnostic metrics.
- Non-destructive legacy test fixture preservation and inventory policy.

### 1.5 Explicit Out-of-Scope Boundaries (Strictly Forbidden in Phase 5A)
| Out-of-Scope Item | Rationale & Phase Placement |
|---|---|
| **Real Data Harvesting / Scraping** | No resumes or job descriptions may be downloaded during the planning phase. |
| **Executing Annotation Pipelines** | Annotations cannot begin before guidelines are reviewed and schemas validated. |
| **Creating Code Scripts / Tools** | Authoring Python scripts (`validate_dataset.py`, etc.) belongs to Phase 5A implementation, not planning. |
| **Database Migrations (V6+)** | Database schemas V1–V5 remain frozen. Research datasets are managed as decoupled file artifacts. |
| **Backend / Frontend Code Modifications** | Application code, REST endpoints, and UI components remain completely untouched. |
| **Sentence-BERT / LLM Model Training** | Modeling and model evaluation are deferred to Phase 5B / Phase 6. |
| **Altering Deterministic Matching Logic** | The Phase 4 deterministic scoring engine is invariant and frozen. |
| **Inferring Protected Demographic Attributes** | Unlawful, unconsented inference of candidate gender, race, or religion is strictly banned. |
| **Deleting or Modifying Existing Fixtures** | Existing sample fixtures in `dataset/raw/` must remain untouched. |

---

## 2. Directory Structure Evaluation & Architectural Recommendation

### 2.1 Proposed Directory Structure (Prompt Proposal)
The initial proposal suggested:
```text
fairhire_ai/
├── research/
│   └── dataset/
│       ├── README.md
│       ├── manifest.csv
│       ├── schemas/
│       ├── raw/
│       ├── normalized/
│       ├── annotations/
│       ├── splits/
│       └── reports/
├── docs/
│   └── research/
│       └── phase-5a/
│           ├── data-dictionary.md
│           ├── collection-protocol.md
│           ├── annotation-guidelines.md
│           ├── privacy-and-usage-policy.md
│           ├── quality-report.md
│           └── decisions.md
└── scripts/
    └── dataset/
        ├── validate_dataset.py
        ├── detect_duplicates.py
        └── generate_quality_report.py
```

### 2.2 Repository Analysis of Existing Structure
Inspection of the current FairHire AI repository reveals:
1. **Existing `dataset/` Directory at Root:** A top-level `dataset/` directory already exists containing `README.md`, `raw/` (with 4 sample resumes and 4 sample JDs from early project scaffolding), `processed/`, `annotations/`, and `schemas/`.
2. **Existing `experiments/` Directory at Root:** A top-level `experiments/` directory already exists (`configs/`, `results/`, `scripts/`) governing experiment runners.
3. **Existing `docs/research/` Directory:** A dedicated research documentation directory already exists under `docs/`.
4. **Existing `scripts/` Directory at Root:** A top-level `scripts/` directory already exists (`create_test_docs.py`, `phase3b_adversarial_revalidation.py`).

### 2.3 Structural Trade-Off Analysis
| Dimension | Option A: Dual-Root (`research/dataset/`) | Option B: Consolidated Architecture (`dataset/`) |
|---|---|---|
| **Root Cleanliness** | Introduces a new top-level `research/` directory parallel to existing `dataset/`. | Reuses and formalizes the established `dataset/` top-level directory. |
| **Duplication Risk** | High: Creates ambiguity between root `dataset/` and `research/dataset/`. | Zero: Eliminates competing dataset directories. |
| **Path Consistency** | Disconnects datasets from `experiments/` which references dataset versions. | Consistent with existing `dataset/README.md` and `experiments/README.md`. |
| **Git & CI Isolation** | Requires updating `.gitignore` for `research/dataset/raw/`. | Directly leverages existing `.gitignore` structures and simplifies pre-commit hooks. |

### 2.4 Recommended Reconciled Directory Structure
To avoid redundant directory trees and maintain architectural elegance, **Option B (Consolidated Architecture)** is formally recommended. The existing `dataset/` directory will be evolved into the authoritative research dataset repository:

```text
fairhire_ai/
├── dataset/                               # Authoritative Research Dataset Root
│   ├── README.md                          # Dataset directory overview and governance
│   ├── manifest.json                      # CANONICAL machine-readable manifest & metadata
│   ├── manifest.csv                       # Generated secondary tabular export (read-only)
│   ├── schemas/                           # Draft 2020-12 JSON Schema validation contracts
│   │   ├── source_manifest.schema.json
│   │   ├── job_description.schema.json
│   │   ├── resume_record.schema.json
│   │   ├── evaluation_pair.schema.json
│   │   ├── annotation.schema.json
│   │   └── adjudication_record.schema.json
│   ├── raw/                               # Quarantined raw source inputs (STRICTLY GIT-IGNORED)
│   │   ├── sample_jds.json                # PRESERVED legacy test fixture (DO NOT DELETE)
│   │   ├── sample_resumes/                # PRESERVED legacy test fixtures (DO NOT DELETE)
│   │   ├── jobs/                          # Raw scraped or input JD files (.txt, .json)
│   │   └── resumes/                       # Raw input resumes (.pdf, .docx, .txt) - RESTRICTED
│   ├── normalized/                        # Canonical, scrubbed, normalized JSON records (TRACKED)
│   │   ├── jobs/                          # Normalized JD records (JD-*.json)
│   │   └── resumes/                       # PII-scrubbed resume records (RES-*.json)
│   ├── annotations/                       # Human and adjudicated annotation records (TRACKED)
│   │   ├── primary/                       # Independent annotator records (ANN-*.json)
│   │   └── adjudicated/                   # Resolved consensus records (ADJ-*.json)
│   ├── pairs/                             # Exploratory evaluation pair definitions (TRACKED)
│   │   └── pairs.json                     # List of evaluation pair records (PAIR-*.json)
│   ├── inventory/                         # Exploratory pilot catalog (TRACKED - NOT A SPLIT)
│   │   └── pilot_record_index.json        # Static record catalog (formal train/test splits deferred)
│   └── reports/                           # Generated validation and audit reports
│       └── quality_report_v0.1.0.md
├── docs/
│   └── research/                          # Research Documentation Root
│       ├── phase-5a-plan.md               # [THIS DOCUMENT] Master Phase 5A plan
│       ├── data-dictionary.md             # Complete field dictionary & taxonomy reference
│       ├── collection-protocol.md         # Source vetting, licensing & intake protocol
│       ├── annotation-guidelines.md       # Detailed skill & exclusionary language rubric
│       └── privacy-and-usage-policy.md    # Legal basis, retention & right-to-be-forgotten rules
└── scripts/
    └── dataset/                           # Dataset Integrity & Audit Tooling
        ├── validate_dataset.py            # JSON schema & referential integrity validator
        ├── detect_duplicates.py           # Exact SHA-256 and MinHash near-duplicate detector
        ├── verify_git_safety.py           # Staged-file security scanner (pre-commit & CI)
        └── generate_quality_report.py     # Metrics, balance, and completeness reporter
```

### 2.5 Non-Destructive Legacy Fixture Preservation Policy
The existing files in `dataset/raw/sample_jds.json` and `dataset/raw/sample_resumes/resume_1.txt..resume_4.txt` were established during early development and may have active dependencies in integration tests across the backend, frontend, or AI service.
- **Zero Deletion Invariant:** These legacy sample fixtures **must NOT be deleted, moved, renamed, or modified** during Phase 5A planning or implementation.
- **Dependency Audit Prerequisite:** Before any future cleanup or archival can occur, a comprehensive dependency audit across all test suites (`backend/src/test/`, `ai-service/tests/`, `frontend/`, `scripts/`) must be conducted and documented in an approved migration proposal.
- **Strict Pipeline Isolation:** Phase 5A research data will reside in dedicated, newly defined directories (`dataset/normalized/jobs/`, `dataset/normalized/resumes/`, `dataset/annotations/`, `dataset/pairs/`), ensuring absolute separation from legacy fixtures.

---

## 3. Data Dictionary & Versioned JSON Schema Specifications

All research dataset records are serialized as deterministic, formatted JSON files validated against explicit **JSON Schema (Draft 2020-12)** specifications. 

### 3.1 Lifecycle & State Transitions
To guarantee semantic clarity, every record type must implement explicit state-tracking enums that differentiate:
- **`MISSING` / `NULL`**: Value does not exist in the source material.
- **`UNKNOWN`**: Evaluated but cannot be determined from available evidence.
- **`PENDING`**: Awaiting review, verification, or adjudication.
- **`APPROVED`**: Formally reviewed, validated, and cleared for research inclusion.
- **`REJECTED`**: Formally denied inclusion due to licensing, quality, or ethics failure.
- **`QUARANTINED`**: Flagged for potential PII, copyright dispute, or integrity anomaly; isolated from experiment pipelines.

### 3.2 Schema 1: Source Manifest (`source_manifest.schema.json`)
Separates declared license information, permitted collection methods, storage permissions, normalization permissions, internal evaluation permissions, repository tracking permissions, public redistribution permissions, and formal reviewer approval. Enforces an explicit conditional invariant requiring reviewer identity, approval date, and positive compatibility across all decoupled permission fields whenever status is `APPROVED`. Critically enforces that internal-only approval can never permit public repository tracking or open redistribution.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/source_manifest.schema.json",
  "title": "SourceManifestRecord",
  "description": "Represents an evaluated and tracked data origin for job descriptions or resumes with decoupled operation-specific permissions.",
  "type": "object",
  "required": [
    "source_id",
    "source_name",
    "source_type",
    "license_or_terms_info",
    "permitted_collection_method",
    "storage_permission",
    "normalization_permission",
    "internal_eval_permission",
    "repo_tracking_permission",
    "redistribution_permission",
    "derived_text_use_permission",
    "legal_rationale_type",
    "defensible_usage_basis",
    "approval_status",
    "pii_risk_level",
    "created_at"
  ],
  "properties": {
    "source_id": {
      "type": "string",
      "pattern": "^SRC-[0-9]{3}$",
      "description": "Unique deterministic identifier, e.g., SRC-001."
    },
    "source_name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 150
    },
    "source_type": {
      "type": "string",
      "enum": [
        "SYNTHETIC",
        "AUTHORIZED_DONATION",
        "PUBLIC_CAREER_PAGE",
        "PUBLIC_RESEARCH_DATASET",
        "OTHER"
      ]
    },
    "origin_url": {
      "type": ["string", "null"],
      "format": "uri"
    },
    "license_or_terms_info": {
      "type": "string",
      "minLength": 3,
      "description": "Exact declared license identifier or excerpted terms of service section."
    },
    "permitted_collection_method": {
      "type": "string",
      "enum": [
        "PROGRAMMATIC_GENERATION",
        "DIRECT_VOLUNTEER_UPLOAD",
        "MANUAL_TRANSCRIPTION",
        "AUTOMATED_SCRAPE_PERMITTED",
        "UNVERIFIED_SCRAPE_QUARANTINED"
      ]
    },
    "storage_permission": {
      "type": "string",
      "enum": [
        "LOCAL_RESTRICTED_RESEARCH_ONLY",
        "PERMITTED_IN_REPO",
        "EPHEMERAL_PROCESSING_ONLY",
        "QUARANTINED_NO_STORAGE"
      ],
      "description": "Storage boundary authorization for source artifacts."
    },
    "normalization_permission": {
      "type": "string",
      "enum": [
        "NORMALIZATION_PERMITTED",
        "NORMALIZATION_PROHIBITED"
      ],
      "description": "Authorization to clean, extract, and normalize derived text."
    },
    "internal_eval_permission": {
      "type": "string",
      "enum": [
        "INTERNAL_EVAL_PERMITTED",
        "INTERNAL_EVAL_PROHIBITED"
      ],
      "description": "Authorization to include entity in offline internal benchmark and algorithm testing."
    },
    "repo_tracking_permission": {
      "type": "string",
      "enum": [
        "PERMITTED_IN_REPO",
        "LOCAL_ONLY_GIT_PROHIBITED"
      ],
      "description": "Git tracking clearance. LOCAL_ONLY_GIT_PROHIBITED strictly bans any commit or tracking in version control."
    },
    "redistribution_permission": {
      "type": "string",
      "enum": [
        "PUBLIC_REDISTRIBUTION_PERMITTED",
        "RESEARCH_DERIVATIVES_ONLY",
        "NO_REDISTRIBUTION_INTERNAL_ONLY"
      ],
      "description": "Defines outward sharing boundaries. NO_REDISTRIBUTION_INTERNAL_ONLY strictly confines data to lab private analysis."
    },
    "derived_text_use_permission": {
      "type": "string",
      "enum": [
        "FULL_RESEARCH_USE",
        "NORMALIZED_AND_ANNOTATED_ONLY",
        "RESTRICTED_INTERNAL_EVAL",
        "PROHIBITED"
      ]
    },
    "legal_rationale_type": {
      "type": "string",
      "enum": [
        "EXPLICIT_OPEN_SOURCE_LICENSE",
        "SIGNED_RESEARCH_DONATION_CONSENT",
        "DOCUMENTED_FAIR_USE_RATIONALE",
        "SYNTHETIC_NO_THIRD_PARTY_RIGHTS",
        "UNVERIFIED_PENDING_REVIEW"
      ],
      "description": "Note: Fair use represents a documented legal rationale requiring case-by-case review, not an automatic grant."
    },
    "terms_of_service_evaluated": {
      "type": "boolean",
      "description": "True if host terms of service have been inspected for research indexing restrictions."
    },
    "defensible_usage_basis": {
      "type": "string",
      "minLength": 20,
      "description": "Detailed rationale justifying academic research use and documenting boundary compliance."
    },
    "approval_status": {
      "type": "string",
      "enum": ["PENDING", "APPROVED", "REJECTED", "QUARANTINED"]
    },
    "approved_by": {
      "type": ["string", "null"]
    },
    "approval_date": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "pii_risk_level": {
      "type": "string",
      "enum": ["NONE_SYNTHETIC", "LOW_SCRUBBED", "HIGH_REQUIRES_MANUAL_AUDIT"]
    },
    "usage_restrictions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "approval_status": { "const": "APPROVED" } }
      },
      "then": {
        "required": [
          "approved_by",
          "approval_date",
          "terms_of_service_evaluated",
          "storage_permission",
          "normalization_permission",
          "internal_eval_permission",
          "repo_tracking_permission",
          "redistribution_permission",
          "derived_text_use_permission",
          "permitted_collection_method",
          "legal_rationale_type"
        ],
        "properties": {
          "approved_by": { "type": "string", "minLength": 3 },
          "approval_date": { "type": "string", "format": "date-time" },
          "terms_of_service_evaluated": { "const": true },
          "storage_permission": {
            "enum": ["LOCAL_RESTRICTED_RESEARCH_ONLY", "PERMITTED_IN_REPO"]
          },
          "normalization_permission": {
            "const": "NORMALIZATION_PERMITTED"
          },
          "internal_eval_permission": {
            "const": "INTERNAL_EVAL_PERMITTED"
          },
          "repo_tracking_permission": {
            "enum": ["PERMITTED_IN_REPO", "LOCAL_ONLY_GIT_PROHIBITED"]
          },
          "derived_text_use_permission": {
            "enum": [
              "FULL_RESEARCH_USE",
              "NORMALIZED_AND_ANNOTATED_ONLY",
              "RESTRICTED_INTERNAL_EVAL"
            ]
          },
          "redistribution_permission": {
            "enum": ["PUBLIC_REDISTRIBUTION_PERMITTED", "RESEARCH_DERIVATIVES_ONLY", "NO_REDISTRIBUTION_INTERNAL_ONLY"]
          },
          "permitted_collection_method": {
            "enum": [
              "PROGRAMMATIC_GENERATION",
              "DIRECT_VOLUNTEER_UPLOAD",
              "MANUAL_TRANSCRIPTION",
              "AUTOMATED_SCRAPE_PERMITTED"
            ]
          },
          "legal_rationale_type": {
            "enum": [
              "EXPLICIT_OPEN_SOURCE_LICENSE",
              "SIGNED_RESEARCH_DONATION_CONSENT",
              "DOCUMENTED_FAIR_USE_RATIONALE",
              "SYNTHETIC_NO_THIRD_PARTY_RIGHTS"
            ]
          }
        }
      }
    },
    {
      "if": {
        "properties": { "storage_permission": { "const": "EPHEMERAL_PROCESSING_ONLY" } }
      },
      "then": {
        "properties": {
          "approval_status": { "enum": ["PENDING", "REJECTED"] },
          "normalization_permission": { "const": "NORMALIZATION_PROHIBITED" },
          "internal_eval_permission": { "const": "INTERNAL_EVAL_PROHIBITED" },
          "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" },
          "redistribution_permission": { "const": "NO_REDISTRIBUTION_INTERNAL_ONLY" },
          "derived_text_use_permission": { "const": "PROHIBITED" }
        }
      }
    },
    {
      "if": {
        "properties": { "storage_permission": { "const": "QUARANTINED_NO_STORAGE" } }
      },
      "then": {
        "properties": {
          "approval_status": { "enum": ["QUARANTINED", "REJECTED"] },
          "normalization_permission": { "const": "NORMALIZATION_PROHIBITED" },
          "internal_eval_permission": { "const": "INTERNAL_EVAL_PROHIBITED" },
          "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" },
          "redistribution_permission": { "const": "NO_REDISTRIBUTION_INTERNAL_ONLY" },
          "derived_text_use_permission": { "const": "PROHIBITED" }
        }
      }
    },
    {
      "if": {
        "properties": { "approval_status": { "const": "QUARANTINED" } }
      },
      "then": {
        "properties": {
          "storage_permission": { "const": "QUARANTINED_NO_STORAGE" },
          "normalization_permission": { "const": "NORMALIZATION_PROHIBITED" },
          "internal_eval_permission": { "const": "INTERNAL_EVAL_PROHIBITED" },
          "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" },
          "redistribution_permission": { "const": "NO_REDISTRIBUTION_INTERNAL_ONLY" },
          "derived_text_use_permission": { "const": "PROHIBITED" }
        }
      }
    },
    {
      "if": {
        "properties": { "approval_status": { "const": "REJECTED" } }
      },
      "then": {
        "properties": {
          "storage_permission": { "enum": ["QUARANTINED_NO_STORAGE", "EPHEMERAL_PROCESSING_ONLY"] },
          "normalization_permission": { "const": "NORMALIZATION_PROHIBITED" },
          "internal_eval_permission": { "const": "INTERNAL_EVAL_PROHIBITED" },
          "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" },
          "redistribution_permission": { "const": "NO_REDISTRIBUTION_INTERNAL_ONLY" },
          "derived_text_use_permission": { "const": "PROHIBITED" }
        }
      }
    },
    {
      "if": {
        "properties": { "approval_status": { "const": "PENDING" } }
      },
      "then": {
        "properties": {
          "storage_permission": { "enum": ["LOCAL_RESTRICTED_RESEARCH_ONLY", "EPHEMERAL_PROCESSING_ONLY"] },
          "normalization_permission": { "const": "NORMALIZATION_PROHIBITED" },
          "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" },
          "redistribution_permission": { "const": "NO_REDISTRIBUTION_INTERNAL_ONLY" },
          "internal_eval_permission": { "const": "INTERNAL_EVAL_PROHIBITED" },
          "derived_text_use_permission": { "const": "PROHIBITED" }
        }
      }
    },
    {
      "if": {
        "properties": { "repo_tracking_permission": { "const": "LOCAL_ONLY_GIT_PROHIBITED" } }
      },
      "then": {
        "properties": {
          "redistribution_permission": {
            "enum": ["RESEARCH_DERIVATIVES_ONLY", "NO_REDISTRIBUTION_INTERNAL_ONLY"]
          }
        }
      }
    },
    {
      "if": {
        "properties": { "redistribution_permission": { "const": "PUBLIC_REDISTRIBUTION_PERMITTED" } }
      },
      "then": {
        "properties": {
          "approval_status": { "const": "APPROVED" },
          "repo_tracking_permission": { "const": "PERMITTED_IN_REPO" },
          "storage_permission": { "const": "PERMITTED_IN_REPO" },
          "normalization_permission": { "const": "NORMALIZATION_PERMITTED" }
        }
      }
    }
  ],
  "additionalProperties": false
}
```

### 3.3 Schema 2: Job Description Record (`job_description.schema.json`)
Encapsulates normalized job postings, domain classification, and cryptographic content hashes.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/job_description.schema.json",
  "title": "JobDescriptionRecord",
  "description": "Normalized job description record used for skill matching and bias auditing.",
  "type": "object",
  "required": [
    "job_id",
    "source_id",
    "title",
    "domain",
    "experience_level",
    "employment_type",
    "location_type",
    "normalized_text_sha256",
    "normalized_text",
    "character_count",
    "content_status",
    "created_at"
  ],
  "properties": {
    "job_id": {
      "type": "string",
      "pattern": "^JD-[0-9]{3}$",
      "description": "Unique identifier, e.g., JD-001."
    },
    "source_id": {
      "type": "string",
      "pattern": "^SRC-[0-9]{3}$",
      "description": "Foreign key reference to source_manifest."
    },
    "title": {
      "type": "string",
      "minLength": 2,
      "maxLength": 150
    },
    "domain": {
      "type": "string",
      "enum": [
        "BACKEND_ENGINEERING",
        "FRONTEND_ENGINEERING",
        "FULLSTACK_ENGINEERING",
        "DATA_SCIENCE_ML",
        "DEVOPS_CLOUD",
        "QA_TESTING",
        "CROSS_FUNCTIONAL"
      ]
    },
    "experience_level": {
      "type": "string",
      "enum": ["INTERNSHIP", "ENTRY", "MID", "SENIOR", "LEAD", "UNKNOWN"]
    },
    "employment_type": {
      "type": "string",
      "enum": ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "UNKNOWN"]
    },
    "location_type": {
      "type": "string",
      "enum": ["REMOTE", "HYBRID", "ON_SITE", "UNKNOWN"]
    },
    "normalized_text_sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$",
      "description": "Cryptographic SHA-256 digest of the normalized UTF-8 text."
    },
    "normalized_text": {
      "type": "string",
      "minLength": 50,
      "description": "Deterministic UTF-8 normalized plain text content."
    },
    "character_count": {
      "type": "integer",
      "minimum": 50
    },
    "content_status": {
      "type": "string",
      "enum": ["RAW", "NORMALIZED", "VERIFIED", "QUARANTINED"]
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}
```

### 3.4 Schema 3: Resume Record (`resume_record.schema.json`)
Represents a de-identified, PII-scrubbed candidate profile. Uses precise privacy terminology (`direct_identifiers_removed` and `de_identification_status`) and defines explicit release eligibility states (`release_eligibility`). To eliminate linkability risks, **raw source hashes of real resumes are never stored in public/tracked records**.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/resume_record.schema.json",
  "title": "ResumeRecord",
  "description": "PII-sanitized candidate resume record with complete provenance tracking and zero public raw linkability.",
  "type": "object",
  "required": [
    "resume_id",
    "source_id",
    "provenance_type",
    "original_format",
    "normalized_text_sha256",
    "normalized_text",
    "pii_scrubbing_status",
    "direct_identifiers_removed",
    "de_identification_status",
    "release_eligibility",
    "target_domain",
    "experience_bracket",
    "created_at"
  ],
  "properties": {
    "resume_id": {
      "type": "string",
      "pattern": "^RES-[0-9]{3}$",
      "description": "Unique identifier, e.g., RES-001."
    },
    "source_id": {
      "type": "string",
      "pattern": "^SRC-[0-9]{3}$",
      "description": "Foreign key reference to source_manifest."
    },
    "provenance_type": {
      "type": "string",
      "enum": [
        "SYNTHETIC_GENERATED",
        "AUTHORIZED_DONATION",
        "PUBLIC_DEFENSIBLE_SAMPLE"
      ]
    },
    "original_format": {
      "type": "string",
      "enum": ["PDF", "DOCX", "TXT"]
    },
    "normalized_text_sha256": {
      "type": "string",
      "pattern": "^[a-f0-9]{64}$",
      "description": "Cryptographic digest of scrubbed normalized text. Raw resume hashes are held exclusively in quarantined private logs to prevent public linkability attacks."
    },
    "normalized_text": {
      "type": "string",
      "minLength": 50,
      "description": "UTF-8 sanitized text with direct identifiers stripped or masked."
    },
    "pii_scrubbing_status": {
      "type": "string",
      "enum": [
        "PENDING_AUDIT",
        "AUTOMATED_SCRUBBED",
        "MANUALLY_AUDITED_CLEAN",
        "QUARANTINED_LEAKAGE_DETECTED"
      ]
    },
    "direct_identifiers_removed": {
      "type": "boolean",
      "description": "True if direct candidate identifiers (name, phone, email, address, handle) have been verified removed."
    },
    "de_identification_status": {
      "type": "string",
      "enum": [
        "PENDING_AUDIT",
        "DIRECT_IDENTIFIERS_STRIPPED",
        "RESIDUAL_RISK_REVIEWED",
        "QUARANTINED_LEAKAGE_DETECTED"
      ],
      "description": "Accurate privacy tier distinguishing mechanical identifier removal from residual quasi-identifier review."
    },
    "release_eligibility": {
      "type": "string",
      "enum": [
        "RESTRICTED_RAW_INPUT",
        "NORMALIZED_PENDING_RISK_AUDIT",
        "RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY",
        "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE",
        "QUARANTINED_HIGH_RISK"
      ],
      "description": "Defines release clearance. Direct-identifier removal alone does NOT qualify a real resume for public tracking or release."
    },
    "scrubbed_by": {
      "type": ["string", "null"]
    },
    "audit_timestamp": {
      "type": ["string", "null"],
      "format": "date-time"
    },
    "target_domain": {
      "type": "string",
      "enum": [
        "BACKEND_ENGINEERING",
        "FRONTEND_ENGINEERING",
        "FULLSTACK_ENGINEERING",
        "DATA_SCIENCE_ML",
        "DEVOPS_CLOUD",
        "QA_TESTING",
        "CROSS_FUNCTIONAL"
      ]
    },
    "experience_bracket": {
      "type": "string",
      "enum": ["STUDENT_INTERN", "JUNIOR_0_2_YRS", "MID_3_5_YRS", "SENIOR_6_PLUS_YRS", "UNKNOWN"]
    },
    "quarantine_flag": {
      "type": "boolean",
      "default": false
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "release_eligibility": { "const": "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE" } }
      },
      "then": {
        "required": ["scrubbed_by", "audit_timestamp"],
        "properties": {
          "scrubbed_by": { "type": "string", "minLength": 3 },
          "audit_timestamp": { "type": "string", "format": "date-time" },
          "direct_identifiers_removed": { "const": true },
          "de_identification_status": { "const": "RESIDUAL_RISK_REVIEWED" },
          "pii_scrubbing_status": { "const": "MANUALLY_AUDITED_CLEAN" },
          "quarantine_flag": { "const": false }
        }
      }
    },
    {
      "if": {
        "properties": { "release_eligibility": { "const": "RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY" } }
      },
      "then": {
        "required": ["scrubbed_by", "audit_timestamp"],
        "properties": {
          "scrubbed_by": { "type": "string", "minLength": 3 },
          "audit_timestamp": { "type": "string", "format": "date-time" },
          "direct_identifiers_removed": { "const": true },
          "de_identification_status": { "const": "RESIDUAL_RISK_REVIEWED" },
          "pii_scrubbing_status": { "const": "MANUALLY_AUDITED_CLEAN" },
          "quarantine_flag": { "const": false }
        }
      }
    },
    {
      "if": {
        "properties": { "release_eligibility": { "const": "QUARANTINED_HIGH_RISK" } }
      },
      "then": {
        "properties": {
          "quarantine_flag": { "const": true }
        }
      }
    }
  ],
  "additionalProperties": false
}
```

### 3.5 Schema 4: Resume-Job Evaluation Pair (`evaluation_pair.schema.json`)
Strictly decouples **pair-sampling rationale** and **pre-experimental fit hypothesis** from ground-truth relevance and production matcher scores.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/evaluation_pair.schema.json",
  "title": "EvaluationPairRecord",
  "description": "Pre-defined candidate-job pair with explicit exploratory hypothesis and zero matcher contamination.",
  "type": "object",
  "required": [
    "pair_id",
    "job_id",
    "resume_id",
    "sampling_rationale",
    "expected_fit_hypothesis",
    "hypothesis_status",
    "pilot_catalog_status",
    "created_at"
  ],
  "properties": {
    "pair_id": {
      "type": "string",
      "pattern": "^PAIR-[0-9]{3}$",
      "description": "Unique identifier, e.g., PAIR-001."
    },
    "job_id": {
      "type": "string",
      "pattern": "^JD-[0-9]{3}$",
      "description": "Foreign key reference to job_description."
    },
    "resume_id": {
      "type": "string",
      "pattern": "^RES-[0-9]{3}$",
      "description": "Foreign key reference to resume_record."
    },
    "sampling_rationale": {
      "type": "string",
      "minLength": 15,
      "description": "Methodological justification explaining why this pair was sampled (e.g., exploring specific skill gaps or domain overlap)."
    },
    "expected_fit_hypothesis": {
      "type": "string",
      "enum": [
        "HYPOTHESIS_HIGH_FIT",
        "HYPOTHESIS_MODERATE_FIT",
        "HYPOTHESIS_LOW_FIT",
        "HYPOTHESIS_INTENTIONAL_MISMATCH",
        "HYPOTHESIS_EXPLORATORY_UNKNOWN"
      ],
      "description": "Pre-experimental assumption regarding candidate fit. Stored strictly as a hypothesis, NOT ground truth."
    },
    "hypothesis_status": {
      "type": "string",
      "enum": [
        "UNVALIDATED_HYPOTHESIS",
        "VALIDATED_BY_HUMAN_GROUND_TRUTH",
        "CONTRADICTED_BY_HUMAN_GROUND_TRUTH",
        "UNRESOLVED_DISPUTED_GROUND_TRUTH"
      ],
      "default": "UNVALIDATED_HYPOTHESIS"
    },
    "pilot_catalog_status": {
      "type": "string",
      "enum": ["EXPLORATORY_PILOT_INVENTORY", "UNASSIGNED_FUTURE_EVAL"],
      "default": "EXPLORATORY_PILOT_INVENTORY",
      "description": "Phase 5A treats pairs as an exploratory catalog. Formal train/test splits are deferred to an approved evaluation protocol."
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}
```

### 3.6 Schema 5: Primary Ground-Truth Annotation Record (`annotation.schema.json`)
Stores primary independent and double-blind diagnostic annotations. Uses conditional validation (`allOf` + `if`/`then`) to enforce that `EVALUATION_PAIR` targets require a valid 5-point Likert human relevance rating and prohibit skill/exclusionary labels, while `JOB_DESCRIPTION` and `RESUME` targets require the appropriate label arrays and prohibit relevance scores. Guarantees that `target_type` and `target_id` prefixes match.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/annotation.schema.json",
  "title": "PrimaryAnnotationRecord",
  "description": "Immutable primary human annotation with conditional target validation and zero matcher contamination.",
  "type": "object",
  "required": [
    "annotation_id",
    "target_type",
    "target_id",
    "annotator_id",
    "annotation_stage",
    "matcher_score_blinded",
    "status",
    "scientific_disclaimer_acknowledged",
    "created_at"
  ],
  "properties": {
    "annotation_id": {
      "type": "string",
      "pattern": "^ANN-[0-9]{3}$",
      "description": "Unique identifier for primary annotations, e.g., ANN-001."
    },
    "target_type": {
      "type": "string",
      "enum": ["JOB_DESCRIPTION", "RESUME", "EVALUATION_PAIR"]
    },
    "target_id": {
      "type": "string",
      "pattern": "^(JD|RES|PAIR)-[0-9]{3}$"
    },
    "annotator_id": {
      "type": "string",
      "pattern": "^(ANN_A|ANN_B)$"
    },
    "annotation_stage": {
      "type": "string",
      "enum": ["PRIMARY_INDEPENDENT", "DOUBLE_BLIND_DIAGNOSTIC"]
    },
    "matcher_score_blinded": {
      "type": "boolean",
      "const": true,
      "description": "Mandatory invariant: Annotators must have ZERO visibility into production matching engine scores."
    },
    "skill_labels": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["skill_name", "necessity", "verbatim_text", "char_start", "char_end"],
        "properties": {
          "skill_name": { "type": "string" },
          "canonical_id": { "type": ["integer", "null"] },
          "necessity": { "type": "string", "enum": ["REQUIRED", "PREFERRED", "UNKNOWN"] },
          "verbatim_text": { "type": "string" },
          "char_start": { "type": "integer", "minimum": 0 },
          "char_end": { "type": "integer", "minimum": 0 },
          "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
        },
        "additionalProperties": false
      }
    },
    "exclusionary_language_labels": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["category", "verbatim_phrase", "char_start", "char_end", "rationale"],
        "properties": {
          "category": {
            "type": "string",
            "enum": [
              "GENDER_CODED_MASCULINE",
              "GENDER_CODED_FEMININE",
              "AGE_BIASED_EXCLUSIONARY",
              "ABILITY_BIASED_EXCLUSIONARY",
              "ELITIST_CREDENTIALIST",
              "UNREALISTIC_EXPERIENCE_REQUIREMENT"
            ]
          },
          "verbatim_phrase": { "type": "string" },
          "char_start": { "type": "integer", "minimum": 0 },
          "char_end": { "type": "integer", "minimum": 0 },
          "suggested_inclusive_alternative": { "type": ["string", "null"] },
          "rationale": { "type": "string", "minLength": 10 }
        },
        "additionalProperties": false
      }
    },
    "human_relevance_label": {
      "type": "object",
      "description": "Human assessment of pair suitability, completely independent of production matcher scores.",
      "required": ["likert_suitability"],
      "properties": {
        "likert_suitability": {
          "type": "integer",
          "minimum": 1,
          "maximum": 5,
          "description": "1 = Completely Unqualified, 2 = Minimally Qualified, 3 = Marginally Qualified, 4 = Well Qualified, 5 = Exceptionally Qualified."
        },
        "qualitative_notes": { "type": "string" }
      },
      "additionalProperties": false
    },
    "status": {
      "type": "string",
      "enum": ["DRAFT", "PENDING_REVIEW", "APPROVED", "DISPUTED", "SUPERSEDED"]
    },
    "scientific_disclaimer_acknowledged": {
      "type": "boolean",
      "const": true,
      "description": "Acknowledges that labels reflect linguistic indicators, not legal determinations of discrimination."
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "allOf": [
    {
      "if": {
        "properties": { "target_type": { "const": "JOB_DESCRIPTION" } }
      },
      "then": {
        "properties": {
          "target_id": { "pattern": "^JD-[0-9]{3}$" },
          "human_relevance_label": false
        },
        "required": ["skill_labels", "exclusionary_language_labels"]
      }
    },
    {
      "if": {
        "properties": { "target_type": { "const": "RESUME" } }
      },
      "then": {
        "properties": {
          "target_id": { "pattern": "^RES-[0-9]{3}$" },
          "exclusionary_language_labels": false,
          "human_relevance_label": false
        },
        "required": ["skill_labels"]
      }
    },
    {
      "if": {
        "properties": { "target_type": { "const": "EVALUATION_PAIR" } }
      },
      "then": {
        "properties": {
          "target_id": { "pattern": "^PAIR-[0-9]{3}$" },
          "skill_labels": false,
          "exclusionary_language_labels": false
        },
        "required": ["human_relevance_label"]
      }
    }
  ],
  "additionalProperties": false
}
```

### 3.7 Schema 6: Adjudication Record (`adjudication_record.schema.json`)
Explicit, dedicated schema representing consensus resolutions when Annotator A and Annotator B diverge. Links back to immutable primary annotations and documents adjudication rationales.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://fairhire.ai/schemas/v1/adjudication_record.schema.json",
  "title": "AdjudicationRecord",
  "description": "Consensus resolution record resolving divergent primary annotations with immutable provenance.",
  "type": "object",
  "required": [
    "adjudication_id",
    "target_type",
    "target_id",
    "adjudicator_id",
    "primary_annotation_ids",
    "discrepancy_types",
    "adjudication_rationale",
    "scientific_disclaimer_acknowledged",
    "adjudicated_at"
  ],
  "properties": {
    "adjudication_id": {
      "type": "string",
      "pattern": "^ADJ-[0-9]{3}$",
      "description": "Unique identifier for adjudication records, e.g., ADJ-001."
    },
    "target_type": {
      "type": "string",
      "enum": ["JOB_DESCRIPTION", "RESUME", "EVALUATION_PAIR"]
    },
    "target_id": {
      "type": "string",
      "pattern": "^(JD|RES|PAIR)-[0-9]{3}$"
    },
    "adjudicator_id": {
      "type": "string",
      "pattern": "^ADJUDICATOR_[0-9]+$"
    },
    "primary_annotation_ids": {
      "type": "array",
      "minItems": 2,
      "items": {
        "type": "string",
        "pattern": "^ANN-[0-9]{3}$"
      },
      "description": "References to the divergent primary annotation records being reconciled."
    },
    "discrepancy_types": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "enum": [
          "SKILL_NECESSITY_MISMATCH",
          "SPAN_BOUNDARY_MISMATCH",
          "EXCLUSIONARY_CATEGORY_MISMATCH",
          "PAIR_SUITABILITY_MISMATCH",
          "FALSE_POSITIVE_DISPUTE"
        ]
      }
    },
    "adjudication_rationale": {
      "type": "string",
      "minLength": 20,
      "description": "Detailed scientific justification documenting how the consensus was determined."
    },
    "resolved_skill_labels": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["skill_name", "necessity", "verbatim_text", "char_start", "char_end"],
        "properties": {
          "skill_name": { "type": "string" },
          "canonical_id": { "type": ["integer", "null"] },
          "necessity": { "type": "string", "enum": ["REQUIRED", "PREFERRED", "UNKNOWN"] },
          "verbatim_text": { "type": "string" },
          "char_start": { "type": "integer", "minimum": 0 },
          "char_end": { "type": "integer", "minimum": 0 }
        },
        "additionalProperties": false
      }
    },
    "resolved_exclusionary_labels": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["category", "verbatim_phrase", "char_start", "char_end", "rationale"],
        "properties": {
          "category": { "type": "string" },
          "verbatim_phrase": { "type": "string" },
          "char_start": { "type": "integer", "minimum": 0 },
          "char_end": { "type": "integer", "minimum": 0 },
          "suggested_inclusive_alternative": { "type": ["string", "null"] },
          "rationale": { "type": "string", "minLength": 10 }
        },
        "additionalProperties": false
      }
    },
    "resolved_pair_suitability": {
      "type": "object",
      "required": ["likert_suitability"],
      "properties": {
        "likert_suitability": { "type": "integer", "minimum": 1, "maximum": 5 },
        "adjudicated_notes": { "type": "string" }
      },
      "additionalProperties": false
    },
    "scientific_disclaimer_acknowledged": {
      "type": "boolean",
      "const": true
    },
    "adjudicated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "allOf": [
    {
      "if": { "properties": { "target_type": { "const": "JOB_DESCRIPTION" } } },
      "then": {
        "properties": {
          "target_id": { "pattern": "^JD-[0-9]{3}$" },
          "resolved_pair_suitability": false
        },
        "required": ["resolved_skill_labels", "resolved_exclusionary_labels"]
      }
    },
    {
      "if": { "properties": { "target_type": { "const": "RESUME" } } },
      "then": {
        "properties": {
          "target_id": { "pattern": "^RES-[0-9]{3}$" },
          "resolved_exclusionary_labels": false,
          "resolved_pair_suitability": false
        },
        "required": ["resolved_skill_labels"]
      }
    },
    {
      "if": { "properties": { "target_type": { "const": "EVALUATION_PAIR" } } },
      "then": {
        "properties": {
          "target_id": { "pattern": "^PAIR-[0-9]{3}$" },
          "resolved_skill_labels": false,
          "resolved_exclusionary_labels": false
        },
        "required": ["resolved_pair_suitability"]
      }
    }
  ],
  "additionalProperties": false
}
```

---

## 4. Rights, Source Approval & Collection Protocol

### 4.1 Decoupled Rights & Operation-Specific Permissions Framework
> [!CAUTION]
> **Legal Assumption Warning:**  
> Academic or non-commercial research intent **does not automatically confer legal permission** to scrape, retain, normalize, or redistribute copyrighted material or personal data. The project must not make unverified legal assertions regarding fair use.

To prevent rights conflation, FairHire AI formally decouples source provenance and governance into **six independent, operation-specific permission decisions**. An affirmative grant in one dimension does not imply or confer rights in another:

1. **Approval Decision (`approval_status`):**
   - Options: `PENDING`, `APPROVED`, `REJECTED`, `QUARANTINED`.
   - Represents formal governance clearance by an identified researcher (`approved_by`, `approval_date`). Formally gatekeeps all downstream processing.
2. **Storage Permission (`storage_permission`):**
   - Options: `LOCAL_RESTRICTED_RESEARCH_ONLY`, `PERMITTED_IN_REPO`, `EPHEMERAL_PROCESSING_ONLY`, `QUARANTINED_NO_STORAGE`.
   - Governs whether and where artifacts may be persisted on disk.
3. **Normalization Permission (`normalization_permission`):**
   - Options: `NORMALIZATION_PERMITTED`, `NORMALIZATION_PROHIBITED`.
   - Governs whether text extraction, linguistic sanitization, PII scrubbing, and token normalization into derivative UTF-8 records are legally authorized.
4. **Internal Evaluation Permission (`internal_eval_permission`):**
   - Options: `INTERNAL_EVAL_PERMITTED`, `INTERNAL_EVAL_PROHIBITED`.
   - Authorizes participation in offline, in-lab model evaluation, matching benchmarking, and pair suitability assessments.
5. **Repository Tracking Permission (`repo_tracking_permission`):**
   - Options: `PERMITTED_IN_REPO`, `LOCAL_ONLY_GIT_PROHIBITED`.
   - Authorizes committing derivative files into version control (`git add`). If `LOCAL_ONLY_GIT_PROHIBITED`, files must strictly reside in gitignored local paths and are barred from Git history.
6. **Public Redistribution Permission (`redistribution_permission`):**
   - Options: `PUBLIC_REDISTRIBUTION_PERMITTED`, `RESEARCH_DERIVATIVES_ONLY`, `NO_REDISTRIBUTION_INTERNAL_ONLY`.
   - Governs outward sharing of derivatives in open-source releases, public replication packages, or external academic benchmark distributions.

### 4.2 Rights & Operations Compatibility Framework

To guarantee fail-closed enforcement across the repository, FairHire AI defines both the **Permissible Operational Archetypes** and an explicit **Prohibited Incompatible States Matrix**:

#### 4.2.1 Permissible Source Permission Combinations (Operational Archetypes)

The table below defines all authorized operational states across the six decoupled dimensions, illustrating how each state maps to repository tracking, internal pipelines, and downstream resume release eligibility:

| Profile State / Archetype | `approval_status` | `storage_permission` | `normalization_permission` | `internal_eval_permission` | `repo_tracking_permission` | `redistribution_permission` | `derived_text_use_permission` | Resulting Resume Release Eligibility | Pipeline Inclusion Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **Synthetic Profile** | `APPROVED` | `PERMITTED_IN_REPO` | `NORMALIZATION_PERMITTED` | `INTERNAL_EVAL_PERMITTED` | `PERMITTED_IN_REPO` | `PUBLIC_REDISTRIBUTION_PERMITTED` | `FULL_RESEARCH_USE` | `RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE` | **CLEARED**: Full public repository, benchmarking, and external release. |
| **Consented Open Donation** | `APPROVED` | `PERMITTED_IN_REPO` | `NORMALIZATION_PERMITTED` | `INTERNAL_EVAL_PERMITTED` | `PERMITTED_IN_REPO` | `PUBLIC_REDISTRIBUTION_PERMITTED` | `NORMALIZED_AND_ANNOTATED_ONLY` | `RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE` | **CLEARED**: Public derivative allowed *only* after human residual risk review. |
| **Internal-Only Research Donation** | `APPROVED` | `LOCAL_RESTRICTED_RESEARCH_ONLY` | `NORMALIZATION_PERMITTED` | `INTERNAL_EVAL_PERMITTED` | `LOCAL_ONLY_GIT_PROHIBITED` | `NO_REDISTRIBUTION_INTERNAL_ONLY` | `RESTRICTED_INTERNAL_EVAL` | `RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY` | **INTERNAL ONLY**: Cleared for local lab benchmarks. Git commit and public release **STRICTLY BLOCKED**. |
| **Public Career Page JD (Fair Use)** | `APPROVED` | `PERMITTED_IN_REPO` | `NORMALIZATION_PERMITTED` | `INTERNAL_EVAL_PERMITTED` | `PERMITTED_IN_REPO` | `RESEARCH_DERIVATIVES_ONLY` | `NORMALIZED_AND_ANNOTATED_ONLY` | N/A (Job Description) | **RESEARCH DERIVATIVE**: Factual text tracked in repo for academic replication only. |
| **Ephemeral Ingestion Probe** | `PENDING` | `EPHEMERAL_PROCESSING_ONLY` | `NORMALIZATION_PROHIBITED` | `INTERNAL_EVAL_PROHIBITED` | `LOCAL_ONLY_GIT_PROHIBITED` | `NO_REDISTRIBUTION_INTERNAL_ONLY` | `PROHIBITED` | `RESTRICTED_RAW_INPUT` | **VOLATILE ONLY**: In-memory inspection only. Disk persistence and pipeline inclusion prohibited. |
| **Quarantined / Disputed Source** | `QUARANTINED` | `QUARANTINED_NO_STORAGE` | `NORMALIZATION_PROHIBITED` | `INTERNAL_EVAL_PROHIBITED` | `LOCAL_ONLY_GIT_PROHIBITED` | `NO_REDISTRIBUTION_INTERNAL_ONLY` | `PROHIBITED` | `QUARANTINED_HIGH_RISK` | **BLOCKED**: Completely isolated from disk, repo, and evaluation pipelines. |
| **Unapproved / Rejected Source** | `REJECTED` | `QUARANTINED_NO_STORAGE` | `NORMALIZATION_PROHIBITED` | `INTERNAL_EVAL_PROHIBITED` | `LOCAL_ONLY_GIT_PROHIBITED` | `NO_REDISTRIBUTION_INTERNAL_ONLY` | `PROHIBITED` | Prohibited from ingestion | **BLOCKED**: Immediate deletion under retention rules. |

#### 4.2.2 Explicitly Prohibited Incompatible Permission States (Fail-Closed Matrix)

Any source manifest exhibiting any of the following incompatible combinations represents a governance breach and is rejected by both Layer 1 schema validation and Layer 2 relational validation:

| Violation ID | Attempted State Combination | Conflicting Dimensions & Invariant Violated | Rejection Mechanism |
|---|---|---|---|
| **INV-STATE-01** | `approval_status: "APPROVED"` with `storage_permission: "EPHEMERAL_PROCESSING_ONLY"` | **Ephemeral Storage Cannot Be Approved:** Approval authorizes persistent dataset entry, which contradicts ephemeral volatile-only status. | Schema `allOf` rejects `storage_permission` enum; `S-VAL-01` rejects pipeline entry. |
| **INV-STATE-02** | `approval_status: "APPROVED"` with `storage_permission: "QUARANTINED_NO_STORAGE"` | **Quarantined Storage Cannot Be Approved:** Quarantined sources cannot enter approved pipelines without remediation. | Schema `allOf` rejects `storage_permission` enum; `S-VAL-01` rejects pipeline entry. |
| **INV-STATE-03** | `approval_status: "APPROVED"` with `normalization_permission: "NORMALIZATION_PROHIBITED"` | **Approved Sources Must Permit Normalization:** Unnormalizable sources cannot produce research records. | Schema `allOf` rejects `normalization_permission`; `S-VAL-03` rejects pipeline entry. |
| **INV-STATE-04** | `approval_status: "APPROVED"` with `internal_eval_permission: "INTERNAL_EVAL_PROHIBITED"` | **Approved Sources Must Permit Internal Evaluation:** Sources barred from evaluation cannot enter the dataset. | Schema `allOf` rejects `internal_eval_permission`; `S-VAL-04` rejects pipeline entry. |
| **INV-STATE-05** | `redistribution_permission: "PUBLIC_REDISTRIBUTION_PERMITTED"` with `repo_tracking_permission: "LOCAL_ONLY_GIT_PROHIBITED"` | **Public Release Requires Version Control Tracking:** Cannot distribute publicly while banning Git tracking. | Schema `allOf` rejects redistribution enum; `S-VAL-05` and `S-VAL-06` abort. |
| **INV-STATE-06** | `redistribution_permission: "PUBLIC_REDISTRIBUTION_PERMITTED"` with `storage_permission: "LOCAL_RESTRICTED_RESEARCH_ONLY"` | **Public Release Requires In-Repo Storage:** Restricted local-only storage contradicts public redistribution. | Schema `allOf` rejects storage enum; `S-VAL-02` and `S-VAL-06` abort. |
| **INV-STATE-07** | `redistribution_permission: "PUBLIC_REDISTRIBUTION_PERMITTED"` with `approval_status != "APPROVED"` | **Public Release Requires Verified Human Approval:** Unapproved sources can never be publicly released. | Schema `allOf` rejects redistribution enum; `S-VAL-06` aborts. |
| **INV-STATE-08** | `approval_status: "QUARANTINED"` with `storage_permission != "QUARANTINED_NO_STORAGE"` | **Quarantined Sources Barred From Persistent Storage:** Quarantined status forces quarantined storage boundary. | Schema `allOf` rejects storage permission; `S-VAL-08` aborts. |
| **INV-STATE-09** | `approval_status: "QUARANTINED"` with `normalization_permission == "NORMALIZATION_PERMITTED"` | **Quarantined Sources Cannot Produce Derived Text:** Normalization of quarantined sources is strictly prohibited. | Schema `allOf` rejects normalization permission; `S-VAL-03` aborts. |
| **INV-STATE-10** | `approval_status: "QUARANTINED"` with `internal_eval_permission == "INTERNAL_EVAL_PERMITTED"` | **Quarantined Sources Cannot Enter Evaluation Pairs:** Disputed or quarantined data cannot be evaluated. | Schema `allOf` rejects internal eval permission; `S-VAL-04` aborts. |
| **INV-STATE-11** | `approval_status: "PENDING"` with `repo_tracking_permission == "PERMITTED_IN_REPO"` | **Unapproved Sources Cannot Be Committed:** Pending review status requires `LOCAL_ONLY_GIT_PROHIBITED`. | Schema `allOf` rejects repo tracking permission; `S-VAL-05` aborts. |
| **INV-STATE-12** | `approval_status: "REJECTED"` with `derived_text_use_permission != "PROHIBITED"` | **Rejected Sources Cannot Yield Derivatives:** Rejected data must be purged, not derived or evaluated. | Schema `allOf` rejects derived text permission; `S-VAL-08` aborts. |

#### 4.2.3 Core Governance Invariant: Internal-Only Approval Never Implies Public Release
> [!CRITICAL]
> **Cardinal Release Invariant (R-INV-01):**  
> **Internal-only research approval can NEVER imply, permit, or facilitate public-release eligibility.**  
> If an approved source manifest possesses `repo_tracking_permission: "LOCAL_ONLY_GIT_PROHIBITED"` or `redistribution_permission: "NO_REDISTRIBUTION_INTERNAL_ONLY"` (e.g., private corporate JD or donor-restricted resume), any child resume record (`RES-XXX`) is mathematically and policy-wise prohibited from bearing `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`. Such records must be assigned `RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY` or `RESTRICTED_RAW_INPUT`, stored exclusively on local disks, and strictly quarantined from Git.

#### 4.2.4 Automated Validator Enforcement & Ingestion Blocking (`validate_dataset.py`)
Automated verification occurs across two distinct barriers:

- **Barrier 1: Local Schema Gate (Layer 1):**  
  `jsonschema.validate()` executes against `source_manifest.schema.json`. The schema's conditional `allOf` constraints enforce all rules in Table 4.2.2. Any schema violation aborts validation with exit code 1.

- **Barrier 2: Relational Pipeline Ingestion Gate (Layer 2):**  
  `validate_dataset.py` traverses all downstream entities (JDs, Resumes, Pairs) and enforces relational rights rules:
  1. **`S-VAL-01` (Source Approval Check):** Asserts foreign key `source_id` references a source in `dataset/manifest.json` with `approval_status == "APPROVED"`. If `PENDING`, `REJECTED`, or `QUARANTINED`, raises fatal error.
  2. **`S-VAL-02` (Storage Boundary Check):** If `source.storage_permission == "LOCAL_RESTRICTED_RESEARCH_ONLY"`, asserts that the entity file does NOT exist in tracked Git index. If `source.storage_permission == "EPHEMERAL_PROCESSING_ONLY"` or `"QUARANTINED_NO_STORAGE"`, asserts that NO entity file exists anywhere on disk in persistent directories.
  3. **`S-VAL-03` (Normalization Permission Check):** If `source.normalization_permission == "NORMALIZATION_PROHIBITED"`, asserts that no normalized JSON file or `normalized_text` exists on disk for that source.
  4. **`S-VAL-04` (Internal Evaluation Check):** If `source.internal_eval_permission == "INTERNAL_EVAL_PROHIBITED"`, asserts that no `evaluation_pair` references an entity originating from this source.
  5. **`S-VAL-05` (Repository Tracking Check):** If `source.repo_tracking_permission == "LOCAL_ONLY_GIT_PROHIBITED"`, scans `git ls-files` and staged files; any presence halts execution with exit code 1.
  6. **`S-VAL-06` (Public Release Invariant Check):** If `resume.release_eligibility == "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`, asserts that `source.redistribution_permission == "PUBLIC_REDISTRIBUTION_PERMITTED"` AND `source.repo_tracking_permission == "PERMITTED_IN_REPO"` AND `source.approval_status == "APPROVED"`. Violations raise a fatal error:  
     `FATAL [S-VAL-06]: Resume {resume_id} claims public release eligibility, but parent source {source_id} does not permit public redistribution. Clearance revoked.`
  7. **`S-VAL-07` (Terms & Legal Basis Verification):** Asserts `source.terms_of_service_evaluated == true` and `source.legal_rationale_type != "UNVERIFIED_PENDING_REVIEW"`.
  8. **`S-VAL-08` (Ephemeral & Quarantined Isolation Check):** Asserts that sources with `storage_permission == "EPHEMERAL_PROCESSING_ONLY"` or `"QUARANTINED_NO_STORAGE"` have zero linked records in `dataset/inventory/pilot_record_index.json` or `dataset/manifest.json` records array.
  9. **Pipeline Abort Rule:** Detection of any rights compatibility violation halts `validate_dataset.py` with exit code 1. Ingestion, normalization, annotation, and pair assembly pipelines immediately terminate.

#### 4.2.5 Consistency Matrix: Written Policy vs. Schema Contract vs. Validator Behavior

| Requirement Dimension | Written Policy Rule (Section 4.1 & 4.2) | JSON Schema Contract (`source_manifest.schema.json`) | Validator Behavior (`validate_dataset.py`) |
|---|---|---|---|
| **Reviewer Identity** | Mandatory human reviewer sign-off prior to ingestion. | Conditional `required`: `["approved_by"]` with `minLength: 3`. | Asserts `source.approved_by` is valid non-empty string; logs approver in audit report. |
| **Approval Timestamp** | Documented audit date-time in ISO 8601 format. | Conditional `required`: `["approval_date"]` with `format: "date-time"`. | Parses date-time; asserts timestamp $\le$ current validation runtime. |
| **Storage Boundaries** | Prohibited or ephemeral sources cannot enter persistent pipeline. | Conditional enum restricts `storage_permission` to `LOCAL_RESTRICTED` or `PERMITTED_IN_REPO`. | Blocks downstream entities from disk/repo if storage permission is `QUARANTINED_NO_STORAGE` or `EPHEMERAL` (`S-VAL-02`, `S-VAL-08`). |
| **Normalization Permission** | Sources forbidding normalization cannot produce derivative text. | Conditional enum requires `normalization_permission: "NORMALIZATION_PERMITTED"`. | Scans `dataset/normalized/`; throws fatal error if normalized text exists for prohibited sources (`S-VAL-03`). |
| **Internal Eval Permission** | Sources forbidding internal eval cannot enter benchmark pairs. | Conditional enum requires `internal_eval_permission: "INTERNAL_EVAL_PERMITTED"`. | Scans `dataset/pairs/`; throws fatal error if unpermitted entities appear in pairs (`S-VAL-04`). |
| **Repository Tracking** | Local-only sources cannot be staged or tracked in Git. | Conditional schema bans `PUBLIC_REDISTRIBUTION` when `LOCAL_ONLY_GIT_PROHIBITED`. | Cross-checks Git tracked index; halts with exit code 1 if local-only files are tracked (`S-VAL-05`). |
| **Public Redistribution** | Internal-only approval never confers public release eligibility. | Conditional schema asserts public redistribution requires repo-tracking clearance. | Asserts resume release eligibility matches parent source redistribution permission (`S-VAL-06`). |
| **Unverified Rights / Terms** | Uninspected ToS or unverified legal basis blocks pipeline entry. | Conditional `"terms_of_service_evaluated": {"const": true}` and legal rationale enum excludes `UNVERIFIED`. | Asserts ToS flag is true; rejects references to pending or disputed legal rationales (`S-VAL-07`). |


### 4.3 Source Classification & Contingency Strategy
| Source Type | Permissible Origin | Target Pilot Contribution | Fallback Contingency |
|---|---|---|---|
| **Synthetic (Primary)** | Programmatically generated candidate archetypes. | **45 Resumes** (Base Target) | Can expand up to $60$ resumes if donated samples are unavailable. Zero PII risk. |
| **Authorized Donations** | Real resumes donated with signed consent. | **Up to 15 Resumes** (Subject to volunteer availability) | If fewer than 15 volunteers consent, shortfall is directly replaced with synthetic profiles. Never lower consent standards. |
| **Public Permissive Samples** | Open-access datasets with verifiable permissive licenses (CC0/CC-BY). | **0 (Optional Exception Only)** | Strictly an optional exception requiring separate approval; not a required quota. |

### 4.4 Four-Stage Source Approval Workflow
No raw file may be ingested or assigned an ID until it completes the 4-stage pipeline:

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Stage 1: Intake │ ──► │  Stage 2: Rights │ ──► │  Stage 3: PII    │ ──► │ Stage 4: Formal │
│ Candidate File  │     │  & Legal Review  │     │  Audit & Scrub   │     │ Source Approval │
└─────────────────┘     └──────────────────┘     └──────────────────┘     └─────────────────┘
        │                         │                        │                       │
        ▼                         ▼                        ▼                       ▼
   Fails Format?            Restricted ToS?         Residual PII?           Passed All Gates:
   HTTP/Encoding Error      Commercial Only         Contact Details?        Assigned SRC-XXX
        │                         │                        │                       │
        └─────────────────────────┴────────────────────────┴───────────────► Quarantined
```

1. **Stage 1: Technical Intake Validation:** Verify format (PDF, DOCX, TXT), valid UTF-8 encoding, and readable text layer (no OCR required).
2. **Stage 2: Rights & Legal Review:** Record license terms, collection method, storage boundaries, and redistribution rights. Ambiguous sources are **quarantined immediately**.
3. **Stage 3: PII Audit & Scrub:** Ensure direct identifiers are eliminated from normalized derivatives.
4. **Stage 4: Formal Sign-Off:** Research Lead records approval in `manifest.json` with identity and timestamp, assigning `SRC-XXX`.

---

## 5. Resume Privacy, Retention, Removal & Access-Control Rules

### 5.1 Accurate Privacy Terminology & Data Minimization
Under the privacy-by-design principle, FairHire AI enforces strict **Data Minimization**:
- Only skills, educational degrees, certifications, and anonymized employment experience spans are retained.
- Direct identifiers are strictly stripped from normalized records:
  - Candidate Full Names
  - Phone and mobile numbers
  - Email addresses
  - Physical postal addresses, zip codes, and street locations
  - Identifying personal URLs and social profiles

#### 5.1.1 PII Detection Specifications & RegEx Patterns
The automated sanitization engine and security scanners execute multi-stage pattern recognition across:

1. **Email Addresses:**  
   Matches standard and RFC 5322 compliant structures:
   `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b`
2. **Telephone Numbers:**  
   Matches international E.164 and national formats (covering country codes, area codes in parentheses, hyphens, dots, and spacing):
   `(?:\+?[0-9]{1,3}[-. ]?)?\(?[0-9]{2,4}\)?[-. ]?[0-9]{3,4}[-. ]?[0-9]{3,9}\b`
3. **Physical Addresses & Postal Codes:**  
   Matches street numbers and road descriptors (`Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way`), city/state lines, US ZIP codes (`\b[0-9]{5}(?:-[0-9]{4})?\b`), Indian 6-digit PIN codes (`\b[1-9][0-9]{5}\b`), and international postal patterns.
4. **Candidate Identifying URLs:**  
   Personal profile links, individual handle pages, and vanity domains:
   - LinkedIn profiles: `(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+`
   - Individual GitHub profiles: `(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+(?:\/)?$` (matches user root, distinguished from project repos)
   - Social networks: `twitter\.com\/`, `x\.com\/`, `facebook\.com\/`, `instagram\.com\/`, `medium\.com\/@[A-Za-z0-9_-]+`
   - Personal vanity portfolio domains containing candidate names or hosted on `.me`, `.dev`, `.io`, `.pages.dev`, `.github.io`.

#### 5.1.2 URL Handling: Preserving Legitimate Technical Evidence
> [!IMPORTANT]
> **Preservation of Non-Identifying Project Evidence:**  
> A naive regex that strips *all* URLs destroys essential technical context (e.g., links to open-source library homepages, project repositories, RFC specifications, or academic DOIs cited in candidate project descriptions or JD requirements).  
> FairHire AI implements an **intelligent URL classification policy**:
> - **Blocked as PII:** Any URL containing personal candidate handles, user profile roots (`/in/`, `/@username`), or vanity domains.
> - **Preserved as Technical Evidence (Whitelisted):** Legitimate, non-identifying project and documentation URLs:
>   - Framework & tool homepages: `https://spring.io/*`, `https://react.dev/*`, `https://kubernetes.io/*`
>   - Documentation hubs: `https://docs.python.org/*`, `https://developer.mozilla.org/*`
>   - Open-source organization repos: `https://github.com/facebook/react`, `https://github.com/spring-projects/spring-boot`, `https://github.com/apache/*`
>   - Technical standards & publications: `https://www.w3.org/TR/*`, `https://ietf.org/rfc/*`, `https://doi.org/*`
> This dual approach ensures rigorous privacy enforcement without destroying factual technical grounding.

#### 5.1.3 Scanner Failure, Unsupported Formats & Uncertain Findings: Fail-Closed Architecture
The PII scanner and staged-file gate operate under a strict **Fail-Closed Mandate**:
1. **Scanner Crashes & Exceptions:** Any unhandled exception, syntax error, or execution abort in `verify_git_safety.py` immediately returns non-zero exit code 1. Execution never falls back to an unverified allow.
2. **Unsupported & Unparseable Formats:** If a file contains invalid UTF-8 byte sequences, corrupt headers, unrecognized compression, or unparseable binary layers, the scanner blocks processing immediately (exit code 1).
3. **Execution Timeouts:** If parsing an individual document exceeds 5000 ms, the scanner aborts and fails closed.
4. **Uncertain & Borderline Findings:** If automated NER or fuzzy pattern matching flags a suspected named entity or identifier with moderate/uncertain confidence ($0.30 \le \text{confidence} < 0.70$):
   - The scanner **cannot** mark the file clean.
   - The document is automatically flagged and isolated to `dataset/quarantine/` with `quarantine_flag: true`.
   - The scanner exits with code 1, emitting a blocking alert that mandates manual human review before the record can proceed.

> [!CAUTION]
> **Accurate Privacy Scope Notice:**  
> Removing direct identifiers produces a **de-identified** record, but does **not guarantee absolute mathematical anonymization**. Residual re-identification risks persist: unique combinations of employment tenure, rare skill combinations, specific regional educational institutions, or niche project scopes can serve as quasi-identifiers that might allow re-identification by individuals with background knowledge. Manual audits minimize but cannot eliminate this residual risk.

### 5.2 Resume Release Eligibility Tiers & Lifecycle Governance

> [!CRITICAL]
> **Core Release Governance Invariant:**  
> **Direct-identifier removal ALONE does NOT qualify a real resume for public tracking, repository commit, or open redistribution.**  
> Stripping names, emails, phone numbers, and physical addresses merely moves a record to the **normalized-but-not-cleared** state (`NORMALIZED_PENDING_RISK_AUDIT`). A real candidate profile remains vulnerable to re-identification via quasi-identifiers (e.g., unique combinations of past employers, niche open-source projects, rare tool combinations, graduation years). No real resume may ever transition to `RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE` without an independent human residual-risk audit AND verified donor open-distribution consent in the parent source manifest.

FairHire AI establishes five explicit lifecycle and release eligibility states:

#### 5.2.1 State Definitions & Boundary Rules

1. **`RESTRICTED_RAW_INPUT` (Raw Intake State):**
   - **Scope:** Original raw files (.pdf, .docx, .txt) received via direct volunteer donation, upload, or authorized input.
   - **Storage Boundary:** Stored exclusively in local quarantined storage (`dataset/raw/resumes/`) with restricted filesystem permissions (`chmod 700` / restricted Windows NTFS ACLs).
   - **Version Control Status:** **STRICTLY GIT-IGNORED.** Never staged, never committed.
   - **Pipeline Status:** Barred from direct matching engine consumption. Used solely as input to deterministic text extraction and sanitization pipelines.
   - **Linkability Safeguard:** Raw file cryptographic hashes are held strictly in private local audit logs and are never exposed in public manifests or records.

2. **`NORMALIZED_PENDING_RISK_AUDIT` (Normalized-But-Not-Cleared State):**
   - **Scope:** Extracted plain text where automated regex and token scrubbing have stripped direct identifiers (`direct_identifiers_removed: true`, `de_identification_status: "DIRECT_IDENTIFIERS_STRIPPED"`, `pii_scrubbing_status: "AUTOMATED_SCRUBBED"` or `"PENDING_AUDIT"`).
   - **Governance Constraint:** This is a provisional, intermediate processing state. Direct-identifier scrubbing alone **does not clear** the record for release.
   - **Storage Boundary:** Local working directories only (`dataset/temp/` or uncommitted local workspace).
   - **Version Control Status:** **NOT COMMITTED.** Quarantined from Git tracking.
   - **Pipeline Status:** May be used for internal algorithm smoke tests by authorized researchers, but barred from public benchmark releases, published evaluation pairs, and shared datasets.

3. **`RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY` (Residual-Risk-Reviewed State / Lab Confidential):**
   - **Scope:** Normalized candidate profiles that have completed comprehensive human audit for quasi-identifiers (`direct_identifiers_removed: true`, `de_identification_status: "RESIDUAL_RISK_REVIEWED"`, `pii_scrubbing_status: "MANUALLY_AUDITED_CLEAN"`), but where:
     - The donor consent agreement restricts use strictly to internal laboratory research (`source.redistribution_permission == "NO_REDISTRIBUTION_INTERNAL_ONLY"` or `"RESEARCH_DERIVATIVES_ONLY"`); OR
     - Residual re-identification sensitivity (e.g., highly specialized regional executive background) requires internal confidentiality.
   - **Storage Boundary:** Local research directory; restricted file access.
   - **Version Control Status:** **INTERNAL RESEARCH ONLY.** If committed to internal private repos, excluded from all public mirrors and external benchmark packages.
   - **Pipeline Status:** Cleared for internal algorithm benchmarking and academic evaluation within the FairHire AI research lab.

4. **`RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE` (Approved for Public Tracking & Redistribution):**
   - **Scope:** Fully vetted records meeting all criteria for public repository tracking and external publication:
     - **Synthetic Profiles:** Programmatically generated archetypes (zero third-party rights, zero PII, `provenance_type: "SYNTHETIC_GENERATED"`); OR
     - **Consented Donated Profiles:** Real resumes where the candidate explicitly executed a signed research consent form permitting open public academic redistribution (`source.redistribution_permission == "PUBLIC_REDISTRIBUTION_PERMITTED"`); AND
     - Direct identifiers verified removed (`direct_identifiers_removed: true`); AND
     - Human manual review of quasi-identifiers completed and signed off (`de_identification_status: "RESIDUAL_RISK_REVIEWED"`, `pii_scrubbing_status: "MANUALLY_AUDITED_CLEAN"`); AND
     - Auditor identity (`scrubbed_by`) and audit date-time (`audit_timestamp`) recorded; AND
     - `quarantine_flag == false`.
   - **Storage Boundary:** Authoritative tracked dataset directory (`dataset/normalized/resumes/RES-XXX.json`).
   - **Version Control Status:** **TRACKED IN GIT.** Indexed in canonical `dataset/manifest.json`.
   - **Pipeline Status:** Cleared for inclusion in published evaluation benchmarks, peer-reviewed replication packages, and open research distributions.

5. **`QUARANTINED_HIGH_RISK` (Quarantined / Unresolved State):**
   - **Scope:** Any record where potential PII leakage is detected, quasi-identifier residual risk is unresolved, donor consent is ambiguous or contested, or a donor withdrawal request is pending.
   - **Governance Constraint:** `quarantine_flag: true`.
   - **Storage Boundary:** Isolated quarantine storage (`dataset/quarantine/`).
   - **Version Control Status:** **STRICTLY PROHIBITED FROM GIT.**
   - **Pipeline Status:** Immediately disabled and excluded from all scoring runs, evaluation pair samplings, and reporting pipelines. Queued for human remediation or permanent deletion under Section 5.5.

#### 5.2.2 Lifecycle & Release Clearance Matrix

| Lifecycle State | Direct IDs Stripped? | Residual Risk Audited? | Donor Redistribution Consent? | Tracked in Git? | Public Release Permitted? | Active Pipeline Use |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **`RESTRICTED_RAW_INPUT`** | No | No | Evaluated at Intake | **NO** (Gitignored) | **NO** (Strictly Barred) | Intake & Extraction Only |
| **`NORMALIZED_PENDING_RISK_AUDIT`** | **Yes** | No | Evaluated at Intake | **NO** (Quarantined) | **NO** (Blocked by Invariant) | Local Smoke Tests Only |
| **`RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY`** | **Yes** | **Yes** | Internal Use Only | Lab Private Only | **NO** (Lab Confidential) | Internal Lab Experiments |
| **`RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE`** | **Yes** | **Yes** | **Explicit Public Consent** (or Synthetic) | **YES** (`dataset/normalized/`) | **YES** (Benchmark Derivative) | Full Public Research Benchmark |
| **`QUARANTINED_HIGH_RISK`** | Unknown / Failed | Unresolved | Contested / Disputed | **NO** (Strictly Blocked) | **NO** (Strictly Blocked) | **COMPLETELY ISOLATED** |


### 5.3 Critical Rule: Hashing is Integrity Verification, NOT Anonymization
> [!CAUTION]
> **Cryptographic Digest Warning:**  
> SHA-256 is a deterministic hash function used strictly for file integrity and duplicate verification. **Hashing a document containing PII does NOT anonymize it.** If an external party possesses a candidate's resume, computing its hash reveals an identical match.  
> **Linkability Mitigation:** To prevent third parties from linking external resumes to research records, **raw resume hashes are never exposed in publicly tracked normalized records**. The public normalized record tracks only `normalized_text_sha256` alongside an opaque `RES-XXX` identifier.

### 5.4 Prohibition Against Protected Attribute Inference
To uphold research ethics and prevent the introduction of proxy bias:
- **No Demographics in Datasets:** Resumes and JDs must NOT be labeled with inferred protected demographic characteristics (e.g., gender, race, ethnicity, religion, sexual orientation, disability status, age).
- Inferences based on names, graduation dates, or collegiate affiliations are strictly prohibited.
- If a resume explicitly mentions demographic proxy indicators (e.g., *"Society of Women Engineers"*), the token is preserved strictly as factual candidate leadership text, but **no secondary demographic attribute may be inferred or generated**.

### 5.5 Realistic Multi-Tier Data Withdrawal & Removal Protocol
Rather than making unrealistic unconditional deletion promises across immutable distributed systems, FairHire AI defines an honest, multi-tier withdrawal procedure:

1. **Active Storage Deletion:** Within **72 business hours** of receiving a verified donor withdrawal request:
   - The associated active raw resume file in `dataset/raw/resumes/` is permanently unlinked and deleted from local storage.
   - The normalized record in `dataset/normalized/resumes/` is deleted.
   - Derived evaluation pairs and annotations referencing the `resume_id` are purged from active datasets.
   - Deletion is verified via automated file existence checks and local cache flushing.
2. **Master Manifest & Takedown Registry:**
   - The record status in `manifest.json` is updated to `WITHDRAWN_DONOR_REQUEST`.
   - The internal hash is logged in `dataset/takedown_log.json` (quarantined) to prevent future re-ingestion.
3. **Backup Retention & Expiry Policies:**
   - Acknowledged Limitation: System backups operate under automated lifecycle retention policies (e.g., 30-day snapshot rotation) and cannot be mutated on demand without invalidating backup integrity.
   - Withdrawn records naturally expire and are overwritten as backup cycles roll over.
4. **Version Control History & Incident Escalation:**
   - Standard Operating Procedure: Raw resumes and donor PII are **never committed to Git in the first place** (enforced by pre-commit and CI gates).
   - Escalation Protocol: If restricted donor data is ever accidentally committed to Git, an immediate Security Incident is declared:
     - The commit history is purged using `git-filter-repo`.
     - Remote branches are force-updated after team coordination.
     - Affected commit hashes are documented in an internal incident report.
5. **Published Aggregate Results:**
   - Pre-existing published academic papers and historical aggregate benchmark figures (e.g., global mean scores) cannot retroactively be altered once printed.
   - However, the candidate's individual records are permanently excluded from all subsequent benchmark releases, future research iterations, and public dataset distributions.

### 5.6 Storage Access Control
- Raw, unscrubbed resumes are quarantined on a restricted local directory accessible only to authorized project researchers (`chmod 700` on POSIX / restricted NTFS ACLs on Windows).
- Decoupled storage: Raw input files are stored on local disks outside public web server roots and outside version control.

---

## 6. Text Normalization, Offsets & Integrity

### 6.1 Deterministic Identifier Scheme
All dataset entities follow fixed-width, zero-padded, monotonic identifiers:
- **Sources:** `SRC-001`, `SRC-002`, ..., `SRC-999`
- **Job Descriptions:** `JD-001`, `JD-002`, ..., `JD-999`
- **Resumes:** `RES-001`, `RES-002`, ..., `RES-999`
- **Evaluation Pairs:** `PAIR-001`, `PAIR-002`, ..., `PAIR-999`
- **Primary Annotations:** `ANN-001`, `ANN-002`, ..., `ANN-999`
- **Adjudications:** `ADJ-001`, `ADJ-002`, ..., `ADJ-999`

### 6.2 Deterministic Text Normalization Pipeline
To guarantee mathematical reproducibility across Windows, Linux, and macOS environments, text normalization follows strict deterministic rules:

```
[Raw File Stream]
       │
       ▼
1. Unicode Normalization: Form NFKC (standardizes ligatures, accented characters, full-width glyphs)
       │
       ▼
2. Line Ending Canonicalization: Standardize \r\n and \r to pure Unix \n
       │
       ▼
3. Control Character Scrubbing: Strip zero-width spaces (\u200B), non-printable control chars (\x00-\x08, \x0B-\x0C, \x0E-\x1F)
       │
       ▼
4. Vertical Whitespace Collapsing: Collapse 3 or more consecutive newlines into exactly 2 (\n\n)
       │
       ▼
5. Horizontal Whitespace Normalization: Convert non-breaking spaces (\u00A0) and tabs to standard ASCII space; collapse repeated spaces
       │
       ▼
6. Trim Boundary Whitespace: Strip leading and trailing whitespace from the document
```

> [!IMPORTANT]
> **Preservation of Semantic Meaning:**  
> Normalization must never strip hyphens in compound technical terms (e.g., `Sentence-BERT`, `CI/CD`), remove symbol indicators (e.g., `C++`, `C#`, `.NET`), or modify capitalization in `normalized_text`. Case sensitivity is preserved in normalized records.

### 6.3 Canonical Unicode Code-Point Indexing Convention
To prevent offset drift across tools and programming languages:
1. **Sole Canonical Standard:** All annotation character offsets (`char_start`, `char_end`) are calculated **strictly as 0-based Python Unicode code-point (scalar value) indices** against the exact versioned `normalized_text` stored in the JSON record.
2. **Distinction from UTF-16 Code Units:** Python string slicing `normalized_text[char_start:char_end]` operates directly on Unicode code points. In contrast, languages like Java (`String.length()`, `charAt()`) and JavaScript (`str.length`, `str[i]`) index by 16-bit UTF-16 code units. For characters within the Basic Multilingual Plane (BMP, $\le \text{U+FFFF}$), code points and UTF-16 code units align 1:1. However, for non-BMP characters (astral plane symbols, mathematical alphanumeric symbols, emoji), a single Unicode code point occupies 2 UTF-16 code units (a surrogate pair).
3. **Consumer Conversion Guidelines:**
   - **Java Consumers:** Must not use raw `substring()` with canonical code-point offsets. Instead, convert code-point offsets using `text.offsetByCodePoints(0, char_start)` and `text.offsetByCodePoints(0, char_end)` before slicing.
   - **JavaScript Consumers:** Must use code-point-aware indexing (e.g., `Array.from(text).slice(char_start, char_end).join('')` or string iterators) rather than UTF-16 `.substring()`.
4. **Mandatory Test Cases:** Automated test suites in `validate_dataset.py` must include test cases verifying offset fidelity across:
   - Non-BMP characters (e.g., astral symbols $\text{U+1F4BC}$).
   - Combining diacritical marks (e.g., precomposed `\u00E9` vs. combining `e\u0301` tested under NFKC normalization stability).
   - High-frequency technical tokens containing punctuation and symbols: `C++`, `C#`, `.NET`, `CI/CD`, `Node.js`, `PL/SQL`, `TCP/IP`.
5. **Automated Validation Invariant:** During dataset validation, the validator asserts:
   $$\text{extracted\_span} = \text{record.normalized\_text}[\text{char\_start}:\text{char\_end}]$$
   $$\text{extracted\_span} \equiv \text{verbatim\_text}$$
   Any character drift, whitespace offset, or text mismatch fails validation immediately.

### 6.4 Near-Duplicate Detection & Split Contamination Prevention
In recruitment screening, near-duplicate resumes (e.g., minor wording updates by the same candidate) or boilerplate job descriptions (identical postings across multiple cities) severely contaminate evaluation splits:
- **Detection Algorithm:** MinHash Locality-Sensitive Hashing (LSH) over character 5-grams and token 3-grams with a Jaccard similarity threshold $\theta = 0.85$.
- **Contamination Rule:** Any document sharing Jaccard similarity $\ge 0.85$ with an existing document must either:
  1. Be rejected during collection, OR
  2. Be placed in the exact same experimental split partition as its near-duplicate to guarantee zero train/test or baseline/test data leakage.

---

## 7. Annotation Guidelines: Skills & Exclusionary Language

### 7.1 Skill Annotation Guidelines
Annotators must extract and classify skills from Job Descriptions and Resumes into canonical categories:

#### Skill Necessity Classification (Job Descriptions)
- **`REQUIRED` (Mandatory):** Explicitly declared as necessary for consideration (e.g., *"Must have 3+ years of Python"*, *"Required: PostgreSQL"*, *"Minimum qualifications: Docker"*). Without this skill, a candidate would be disqualified at baseline.
- **`PREFERRED` (Bonus):** Explicitly declared as advantageous but not mandatory (e.g., *"Nice to have: Kubernetes"*, *"Bonus points for GraphQL"*, *"Preferred: AWS certification"*).
- **Precedence Rule:** If a skill appears ambiguously in both sections, it defaults to `REQUIRED`.
- **Text Grounding Mandate:** Every annotated skill **must** include its exact verbatim text span and 0-based character offsets (`char_start`, `char_end`) within `normalized_text`. No ungrounded "implied" skills are permitted.

### 7.2 Exclusionary Language Taxonomy (Job Descriptions)
Job descriptions frequently contain language that inadvertently signals demographic preferences or establishes unnecessary barriers to entry. The research framework tracks six explicit linguistic categories grounded in scientific literature:

| Category | Definition & Scientific Grounding | Prototypical Lexicon Examples | Inclusive Rewrite Alternative |
|---|---|---|---|
| **`GENDER_CODED_MASCULINE`** | Agentic phrasing shown to reduce application rates among women (Gaucher et al., 2011). | *"Aggressive leader"*, *"Dominant rockstar"*, *"Fearless ninja"*, *"Headstrong"*, *"Competitive drive"* | *"Driven professional"*, *"Focused team leader"*, *"Self-directed engineer"* |
| **`GENDER_CODED_FEMININE`** | Communal phrasing that disproportionately stereotypes supportive roles (Gaucher et al., 2011). | *"Nurturing mentor"*, *"Supportive and warm"*, *"Gentle coordinator"*, *"Understanding partner"* | *"Collaborative mentor"*, *"Empathetic team member"*, *"Supportive colleague"* |
| **`AGE_BIASED_EXCLUSIONARY`** | Phrasing that explicitly or implicitly deters older or mid-career candidates. | *"Digital native"*, *"Young, energetic team"*, *"Recent college graduate only"*, *"Maximum 5 years experience"* | *"Proficient with modern web tools"*, *"Dynamic and motivated team"*, *"Entry-level qualifications"* |
| **`ABILITY_BIASED_EXCLUSIONARY`** | Unjustified physical or sensory demands for desk-based technical roles. | *"Must be able to lift 30 lbs"* (for software role), *"Must stand for long periods"* | Focus strictly on technical duties; remove irrelevant physical barriers. |
| **`ELITIST_CREDENTIALIST`** | Restrictive educational or pedigree barriers disconnected from job competencies. | *"Tier 1 / Ivy League university degree required"*, *"Top-tier pedigree only"* | *"Bachelor's degree in CS or equivalent practical experience"* |
| **`UNREALISTIC_EXPERIENCE`** | Chronologically impossible or absurd experience thresholds. | *"10+ years experience in Rust"* (language created in 2015), *"5+ years experience in Fastify v4"* | Align required years with technology release dates. |

### 7.3 Grounding, Evidence Spans & Rationales
Every flagged exclusionary term requires:
1. `verbatim_phrase`: Exact substring extracted from `normalized_text`.
2. `char_start` and `char_end`: Exact character bounds.
3. `rationale`: Clear explanation citing the exclusionary barrier.
4. `suggested_inclusive_alternative`: Proposed neutral reformulation.

### 7.4 Scientific Integrity, Matcher-Blinding & Non-Circularity Safeguards
> [!IMPORTANT]
> **Mandatory Scientific Disclaimer & Matcher-Blinding Invariant:**  
> 1. **Linguistic Indicators $\neq$ Discrimination:** Labeling a job description phrase as `GENDER_CODED_MASCULINE` or `AGE_BIASED` denotes a linguistic indicator of potentially exclusionary wording. It **does NOT constitute legal proof of discriminatory hiring intent, adverse impact, or unlawful employment practices** by the hiring organization.  
> 2. **Matcher-Blinding Invariant:** Annotators must evaluate candidate-job pairs with **zero access to production matching engine scores**. Exposing algorithmic match scores to human evaluators introduces severe anchoring bias.  
> 3. **Non-Circularity Invariant:** Researchers **must never derive gold labels from FairHire AI's production matching engine scores**. The deterministic matching engine is an evaluation target, not an annotator oracle. Ground-truth labels must be determined strictly from human textual inspection.

---

## 8. Double-Annotation Pilot, Agreement Metrics & Adjudication Protocol

### 8.1 Pilot Scope & Minimum Entity Targets
To evaluate guideline clarity, discover edge cases, and measure inter-rater reliability early across all annotation modalities, FairHire AI establishes explicit, separate minimum double-annotation quotas across all three entity types:

1. **Job Descriptions:** **Minimum of 10 Job Descriptions** independently double-annotated by Annotator A and Annotator B ($10 \times 2 = 20$ primary annotation records).
2. **Resume Samples:** **Minimum of 10 Candidate Resumes** independently double-annotated by Annotator A and Annotator B ($10 \times 2 = 20$ primary annotation records).
3. **Evaluation Pairs:** **Minimum of 20 Evaluation Pairs** independently double-annotated by Annotator A and Annotator B ($20 \times 2 = 40$ primary annotation records).

*Total Primary Annotation Record Inventory:*
- **Double-Annotated Primary Records:** $20 \text{ (JDs)} + 20 \text{ (Resumes)} + 40 \text{ (Pairs)} = 80 \text{ double-blind records}$.
- **Single-Annotated Primary Records:** $20 \text{ (remaining JDs)} + 50 \text{ (remaining Resumes)} + 40 \text{ (remaining Pairs)} = 110 \text{ single-pass records}$.
- **Total Authoritative Primary Annotations (`ANN-XXX`):** Exactly $80 + 110 = 190 \text{ records}$.

- **Independent Double-Blind Setup:** Annotator A (`ANN_A`) and Annotator B (`ANN_B`) evaluate the exact same assigned documents and candidate pairs independently without communication, shared draft sheets, or visibility into each other's work or matching engine scores.

### 8.2 Inter-Annotator Agreement (IAA) Diagnostic Reporting
Upon completion of the pilot, agreement is evaluated across multiple diagnostic dimensions:
1. **Prevalence & Marginal Counts:** Raw counts of skills and exclusionary tokens identified by Annotator A vs. Annotator B.
2. **Observed Percent Agreement ($P_o$):** Direct observed overlap across discrete decisions.
3. **Chance-Corrected Agreement (Cohen's Kappa $\kappa$):** Calculated for skill necessity (`REQUIRED` vs. `PREFERRED`) and exclusionary category assignments where class balances permit.
   $$\kappa = \frac{P_o - P_e}{1 - P_e}$$
   *Prevalence Caveat:* When a category is exceedingly rare, $\kappa$ can be artificially depressed despite high raw agreement; marginal distributions must be reported alongside $\kappa$.
4. **Span Overlap (Token & Character F1):** Measuring boundary agreement on extracted text spans:
   $$\text{F1}_{\text{span}} = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$
5. **Category Confusion Breakdown:** Detailed confusion matrices displaying where annotators disagreed (e.g., `GENDER_CODED_MASCULINE` vs. neutral leadership phrasing).
6. **Pair Suitability Agreement:** Quadratic Weighted Kappa ($\kappa_w$) and absolute percentage agreement on the 1–5 Likert suitability scale across the 20 double-annotated evaluation pairs.

### 8.3 Diagnostic Review Triggers & Guideline Revision Protocol
Agreement thresholds are treated as **review triggers**, not proof of broad statistical generalizability:
- **Diagnostic Review Trigger:** If $\kappa < 0.70$ on categorical labels, Span F1 $< 0.80$, or Pair Likert agreement $< 75\%$:
  1. **Annotation Freeze:** Further annotation is immediately paused.
  2. **Root-Cause Error Analysis:** Reviewers analyze the category confusion matrix to identify ambiguous guideline definitions.
  3. **Guideline Clarification:** `docs/research/annotation-guidelines.md` is updated with positive and negative counter-examples clarifying the disputed boundary.
  4. **Pilot Re-Annotation:** The 10 pilot documents or 20 pilot pairs are re-annotated independently under revised guidelines before full-scale annotation commences.
- **Scientific Honesty Rule:** Reported agreement metrics must **never be fabricated, suppressed, or arbitrarily tuned** to force a quality gate pass. Low agreement must be honestly documented as a pilot finding.

### 8.4 Formal Adjudication & Dispute Resolution Workflow
When Annotator A and Annotator B diverge on any double-annotated entity:
1. **Primary Immutability:** The raw annotations from Annotator A (`ANN_A`) and Annotator B (`ANN_B`) are **never edited or deleted**. They remain permanently recorded in `dataset/annotations/primary/`.
2. **Automated Discrepancy Identification:** Divergences are flagged automatically by script according to entity-specific rules:
   - **For Job Descriptions (`JD-XXX`):** Flagged on (a) skill necessity mismatch (`REQUIRED` vs `PREFERRED`), (b) span boundary non-overlap ($F1 < 1.0$), or (c) exclusionary language category mismatch or disputed phrase boundary.
   - **For Resumes (`RES-XXX`):** Flagged on (a) skill presence/absence mismatch, (b) necessity mismatch, or (c) span boundary non-overlap.
   - **For Evaluation Pairs (`PAIR-XXX`):** Flagged whenever raters diverge on the 1–5 Likert suitability rating ($|\text{score}_A - \text{score}_B| \ge 1$).
3. **Adjudication Review:** A third Senior Researcher (Adjudicator) reviews the divergent primary records alongside the underlying text.
4. **Adjudication Record Generation:** The Adjudicator records a consensus resolution in `dataset/annotations/adjudicated/` validated against `adjudication_record.schema.json` (`ADJ-XXX`):
   - `adjudication_id`: `ADJ-001`
   - `primary_annotation_ids`: `["ANN-004", "ANN-005"]`
   - `discrepancy_types`: e.g. `["SKILL_NECESSITY_MISMATCH"]` or `["PAIR_SUITABILITY_MISMATCH"]`
   - Consensus fields:
     - For JDs: `resolved_skill_labels` and `resolved_exclusionary_labels`
     - For Resumes: `resolved_skill_labels`
     - For Pairs: `resolved_pair_suitability: {"likert_suitability": L, "adjudicated_notes": "..."}`
   - `adjudication_rationale`: Detailed written scientific rationale explaining the consensus determination.
5. **Consensus Invariant:** If Annotator A and Annotator B agree identically ($|\text{score}_A - \text{score}_B| == 0$ and spans match identically), the primary annotation serves as established ground truth without requiring an adjudication record.

---

## 9. Pilot Sampling Strategy, Target Counts & Future Split Leakage Controls

### 9.1 Reconciled Pilot Sampling Targets
The pilot target allocation is reconciled across all sections:

| Category | Reconciled Target Count | Details & Allocation |
|---|---|---|
| **Job Descriptions** | **30 Records** | **25 Domain-Specific Technical** (Backend, Frontend, Full Stack, Data Science, DevOps, QA) + **5 Cross-Functional / Leadership**. |
| **Resume Samples** | **60 Records** | **Recommended Base Target: 45 Synthetic + up to 15 Authorized Donated** (subject to volunteer availability). If donations fall short, scale synthetic up to 60. Public resumes are optional exceptions only. |
| **Evaluation Pairs** | **60 Pairs** | Stratified by Fit Hypothesis: 20 High Fit, 20 Moderate Fit, 10 Low Fit, 10 Intentional Mismatches. |
| **Double-Annotation Pilot** | **10 JDs + 10 Resumes + 20 Pairs** | Complete double-blind diagnostic annotation (80 ANN records: 20 JD, 20 RES, 40 PAIR) + full adjudication of all divergences across all 3 entity types. |

### 9.2 Stratification Matrix (Entity Allocation Guide)

> [!IMPORTANT]
> **Allocation Guide Notice (Entity Inventory vs. Evaluation Pairs):**  
> The matrix below serves strictly as an **entity inventory allocation guide** for generating, balancing, and collecting the 30 Job Descriptions and 60 candidate resumes across domains and seniority levels.  
> **It is NOT a definition, listing, or cross-product of the 60 evaluation pairs.** Candidate-job pairings are constructed through the distinct, reproducible sampling protocol specified in Section 9.3.

```
┌─────────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Domain                  │ Intern/Entry │     Mid      │    Senior    │    Total     │
├─────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Backend Engineering     │  1 JD / 2 RES│  2 JD / 4 RES│  2 JD / 4 RES│  5 JD / 10 RES│
│ Frontend Engineering    │  1 JD / 2 RES│  2 JD / 4 RES│  1 JD / 2 RES│  4 JD / 8 RES │
│ Fullstack Engineering   │  1 JD / 2 RES│  2 JD / 4 RES│  1 JD / 2 RES│  4 JD / 8 RES │
│ Data Science / AI / ML  │  1 JD / 2 RES│  2 JD / 4 RES│  2 JD / 4 RES│  5 JD / 10 RES│
│ DevOps / Cloud Infra    │  1 JD / 2 RES│  1 JD / 2 RES│  2 JD / 4 RES│  4 JD / 8 RES │
│ QA / Automation         │  1 JD / 2 RES│  1 JD / 2 RES│  1 JD / 2 RES│  3 JD / 6 RES │
│ Cross-Functional / Lead │  0 JD / 0 RES│  2 JD / 4 RES│  3 JD / 6 RES│  5 JD / 10 RES│
├─────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Technical Subtotal      │  6 JD / 12 RES│ 10 JD / 20 RES│  9 JD / 18 RES│ 25 JD / 50 RES│
│ Cross-Functional Subtot │  0 JD / 0 RES│  2 JD / 4 RES│  3 JD / 6 RES│  5 JD / 10 RES│
├─────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Total Records           │  6 JD / 12 RES│ 12 JD / 24 RES│ 12 JD / 24 RES│ 30 JD / 60 RES│
└─────────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

*Mathematical Verification:*
- Column sums: $6 + 12 + 12 = 30$ JDs; $12 + 24 + 24 = 60$ Resumes.
- Row sums: Technical ($25$ JDs, $50$ RES) + Cross-Functional ($5$ JDs, $10$ RES) $= 30$ JDs and $60$ Resumes.

### 9.3 Fully Deterministic Evaluation-Pair Sampling Protocol

To construct the **60 exploratory candidate-job pairs** from the 30 JDs and 60 resumes, FairHire AI defines an exhaustive, fully deterministic sampling procedure that eliminates arbitrary pairing while preventing matcher score contamination.

#### 9.3.1 Entity Repetition, Zero Resume Reuse & Sampling Geometry
The 60 evaluation pairs are formed under strict mathematical constraints:

- **Job Description Repetition (Allowed and Required):**  
  - Each of the 30 JDs is paired **exactly 2 times** across the dataset ($30 \text{ JDs} \times 2 = 60 \text{ pairs}$).
  - For each JD, the two pairings deliberately represent **contrasting fit hypotheses** (specified in Section 9.3.4). This dual-pairing structure enables direct within-job pairwise candidate preference and ranking analysis.
  - **Upper Bound Invariant:** No JD may appear in more than 2 pairs in Phase 5A.
- **Candidate Resume Repetition (Strict Zero Resume Reuse in Phase 5A):**  
  - In Phase 5A, **every one of the 60 candidate resumes appears in exactly 1 evaluation pair** ($60 \text{ Resumes} \times 1 = 60 \text{ pairs}$).
  - **Zero Reuse Mandate:** To ensure complete alignment with canonical inventory requirements, no candidate resume is reused across multiple pairs. Multi-pair candidate reuse and cross-role sensitivity probing are **strictly deferred to Phase 5B**.
  - **Inventory Utilization:** Guarantees $100\%$ inventory utilization with zero wasted records and zero cross-pair candidate contamination.
- **Deterministic Sampling Seed:**  
  - Pair selection is driven by a deterministic script (`scripts/dataset/sample_evaluation_pairs.py`) using a fixed random seed (`seed = 42`) operating on lexicographically sorted lists of `job_id` and `resume_id` records, ensuring bit-for-bit reproducibility across research runs.

#### 9.3.2 Canonical Skill Coverage Ratio & Non-Overlapping Intervals
To prevent matcher contamination, pre-experimental skill overlap is calculated using the **Canonical Required Skill Coverage Ratio ($C$)**:

$$C = \frac{|\text{Resume Canonical Skills} \cap \text{JD Required Canonical Skills}|}{|\text{JD Required Canonical Skills}|}$$

Where:
- $\text{JD Required Canonical Skills}$ is the set of canonical skill taxonomy IDs (from Phase 3B taxonomy) explicitly annotated as `REQUIRED` in the job description.
- $\text{Resume Canonical Skills}$ is the set of canonical skill taxonomy IDs present in the candidate profile.
- This ratio is computed strictly from document structural annotations. **Production matching engine scores (`deterministic-v1`, `BigDecimal` HALF_UP) MUST NEVER be run, computed, or consulted.**

FairHire AI partitions $C \in [0.00, 1.00]$ into **exhaustive, non-overlapping intervals**:

| Hypothesis Bucket | Non-Overlapping Skill Coverage Interval ($C$) | Coverage Description |
|---|:---:|---|
| **`HYPOTHESIS_HIGH_FIT`** | $[0.80, 1.00]$ ($80\% \le C \le 100\%$) | Substantial mastery of all required qualifications. |
| **`HYPOTHESIS_MODERATE_FIT`** | $[0.45, 0.80)$ ($45\% \le C < 80\%$) | Core foundation present; minor skill or tool gaps. |
| **`HYPOTHESIS_LOW_FIT`** | $[0.15, 0.45)$ ($15\% \le C < 45\%$) | Peripheral familiarity; severe skill deficits. |
| **`HYPOTHESIS_INTENTIONAL_MISMATCH`** | $[0.00, 0.15)$ ($0\% \le C < 15\%$) | Orthogonal profile; negligible or coincidental skill overlap. |

*Mathematical Exhaustiveness:* The four intervals are mutually exclusive and collectively exhaustive over $[0.00, 1.00]$.

#### 9.3.3 Mathematically Formal Conflict Precedence, Bucket-Selection Algorithm & Decision Table

When candidate target domain, experience bracket (seniority), and skill coverage offer conflicting signals, the sampler resolves them using a **strictly deterministic, mathematically closed assignment function**. Production matching engine scores (`deterministic-v1`, `BigDecimal` HALF_UP) are **strictly barred from invocation or consultation**.

##### 1. Formal Ordinal Rank Representation
Let the four hypothesis buckets be mapped to ordinal rank values $\mathcal{B} = \{1, 2, 3, 4\}$:
- **Rank 4:** `HYPOTHESIS_HIGH_FIT`
- **Rank 3:** `HYPOTHESIS_MODERATE_FIT`
- **Rank 2:** `HYPOTHESIS_LOW_FIT`
- **Rank 1:** `HYPOTHESIS_INTENTIONAL_MISMATCH`

##### 2. Raw Skill Coverage Function ($B_{\text{skill}}$)
Let $C \in [0.00, 1.00]$ be the Canonical Required Skill Coverage Ratio defined in Section 9.3.2. The raw skill bucket $B_{\text{skill}}(C) \in \{1, 2, 3, 4\}$ is evaluated over exhaustive, non-overlapping intervals:
$$B_{\text{skill}}(C) = \begin{cases}
4 \ (\text{HYPOTHESIS\_HIGH\_FIT}), & \text{if } C \in [0.80, 1.00] \\
3 \ (\text{HYPOTHESIS\_MODERATE\_FIT}), & \text{if } C \in [0.45, 0.80) \\
2 \ (\text{HYPOTHESIS\_LOW\_FIT}), & \text{if } C \in [0.15, 0.45) \\
1 \ (\text{HYPOTHESIS\_INTENTIONAL\_MISMATCH}), & \text{if } C \in [0.00, 0.15)
\end{cases}$$

##### 3. Seniority Delta Ceiling Function ($C_{\Delta}$)
Let $S_{\text{RES}}, S_{\text{JD}} \in \{1, 2, 3\}$ denote seniority tiers (Intern/Entry $= 1$, Mid $= 2$, Senior/Lead $= 3$).  
Let the absolute seniority difference be $\Delta = |S_{\text{RES}} - S_{\text{JD}}| \in \{0, 1, 2\}$.  
The Seniority Ceiling $C_{\Delta}(\Delta) \in \{2, 3, 4\}$ defines an upper bound:
$$C_{\Delta}(\Delta) = \begin{cases}
4 \ (\text{HIGH\_FIT ceiling / No Penalty}), & \text{if } \Delta = 0 \\
3 \ (\text{MODERATE\_FIT ceiling}), & \text{if } \Delta = 1 \\
2 \ (\text{LOW\_FIT ceiling}), & \text{if } \Delta \ge 2
\end{cases}$$

##### 4. Closed-Form Bucket Assignment Function
The final hypothesis bucket for pair $(JD_i, RES_j)$ is computed via the closed-form equation:
$$\text{Bucket}(JD_i, RES_j) = \begin{cases}
1 \ (\text{HYPOTHESIS\_INTENTIONAL\_MISMATCH}), & \text{if } \text{IsOrthogonal}(D_{\text{JD}}, D_{\text{RES}}) = \text{True} \\
\min(B_{\text{skill}}(C), C_{\Delta}(\Delta)), & \text{if } \text{IsOrthogonal}(D_{\text{JD}}, D_{\text{RES}}) = \text{False}
\end{cases}$$

##### 5. Fundamental Mathematical Properties of the Assignment
1. **Precedence 1 (Domain Override):** If domains are orthogonal (e.g. QA Automation vs Data Science ML, Frontend React vs Embedded Firmware), domain incompatibility forces $\text{Bucket} = 1$ (`INTENTIONAL_MISMATCH`) regardless of $C$ or $\Delta$. Non-transferable domain barriers cannot be bridged by generic shared keywords.
2. **Precedence 2 (Ceiling Suppression via $\min$):** When domains are compatible, seniority acts strictly as an **upper bound (ceiling)**. If raw skill mastery exceeds the seniority ceiling ($B_{\text{skill}} > C_{\Delta}$), the candidate is suppressed down to $C_{\Delta}$:
   - High skill ($B_{\text{skill}} = 4$) with moderate gap ($\Delta = 1, C_{\Delta} = 3$) $\implies \min(4, 3) = 3$ (`MODERATE_FIT`).
   - High skill ($B_{\text{skill}} = 4$) with severe gap ($\Delta = 2, C_{\Delta} = 2$) $\implies \min(4, 2) = 2$ (`LOW_FIT`).
   - Moderate skill ($B_{\text{skill}} = 3$) with severe gap ($\Delta = 2, C_{\Delta} = 2$) $\implies \min(3, 2) = 2$ (`LOW_FIT`).
3. **Precedence 3 (Lower-Bucket Invariance / No Promotion):** Seniority **can never promote a candidate upward**. When $B_{\text{skill}} \le C_{\Delta}$, $\min(B_{\text{skill}}, C_{\Delta}) = B_{\text{skill}}$:
   - Low skill ($B_{\text{skill}} = 2$) with moderate gap ($\Delta = 1, C_{\Delta} = 3$) $\implies \min(2, 3) = 2$ (`LOW_FIT`). A candidate with low skills is never promoted to Moderate Fit simply because their experience delta is small!
   - Low skill ($B_{\text{skill}} = 2$) with zero gap ($\Delta = 0, C_{\Delta} = 4$) $\implies \min(2, 4) = 2$ (`LOW_FIT`).
   - Moderate skill ($B_{\text{skill}} = 3$) with moderate gap ($\Delta = 1, C_{\Delta} = 3$) $\implies \min(3, 3) = 3$ (`MODERATE_FIT`).
4. **Bottom-Bucket Floor Invariance:** If $C < 0.15$ ($B_{\text{skill}} = 1$), then for any $\Delta \in \{0, 1, 2\}$, $\min(1, C_{\Delta}) = 1$ (`INTENTIONAL_MISMATCH`). A candidate missing $> 85\%$ of required technical skills is always an Intentional Mismatch.

##### 6. Exhaustive 16-Row Decision Matrix

The table below enumerates all possible combinations of Domain Compatibility, Seniority Delta $\Delta$, and Skill Coverage Interval $C$:

| Case ID | Domain Relationship | Seniority Delta $\Delta$ | Skill Coverage Interval ($C$) | Raw Skill $B_{\text{skill}}$ | Seniority Cap $C_{\Delta}$ | Formula Evaluation | Final Hypothesis Bucket |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **CASE-01** | Compatible / Aligned | $\Delta = 0$ (Exact) | $[0.80, 1.00]$ (High) | 4 | 4 | $\min(4, 4) = 4$ | **`HYPOTHESIS_HIGH_FIT`** |
| **CASE-02** | Compatible / Aligned | $\Delta = 1$ (Moderate Gap) | $[0.80, 1.00]$ (High) | 4 | 3 | $\min(4, 3) = 3$ | **`HYPOTHESIS_MODERATE_FIT`** (Capped) |
| **CASE-03** | Compatible / Aligned | $\Delta = 2$ (Severe Gap) | $[0.80, 1.00]$ (High) | 4 | 2 | $\min(4, 2) = 2$ | **`HYPOTHESIS_LOW_FIT`** (Capped) |
| **CASE-04** | Compatible / Aligned | $\Delta = 0$ (Exact) | $[0.45, 0.80)$ (Moderate) | 3 | 4 | $\min(3, 4) = 3$ | **`HYPOTHESIS_MODERATE_FIT`** |
| **CASE-05** | Compatible / Aligned | $\Delta = 1$ (Moderate Gap) | $[0.45, 0.80)$ (Moderate) | 3 | 3 | $\min(3, 3) = 3$ | **`HYPOTHESIS_MODERATE_FIT`** |
| **CASE-06** | Compatible / Aligned | $\Delta = 2$ (Severe Gap) | $[0.45, 0.80)$ (Moderate) | 3 | 2 | $\min(3, 2) = 2$ | **`HYPOTHESIS_LOW_FIT`** (Capped) |
| **CASE-07** | Compatible / Aligned | $\Delta = 0$ (Exact) | $[0.15, 0.45)$ (Low) | 2 | 4 | $\min(2, 4) = 2$ | **`HYPOTHESIS_LOW_FIT`** (No Promotion) |
| **CASE-08** | Compatible / Aligned | $\Delta = 1$ (Moderate Gap) | $[0.15, 0.45)$ (Low) | 2 | 3 | $\min(2, 3) = 2$ | **`HYPOTHESIS_LOW_FIT`** (No Promotion) |
| **CASE-09** | Compatible / Aligned | $\Delta = 2$ (Severe Gap) | $[0.15, 0.45)$ (Low) | 2 | 2 | $\min(2, 2) = 2$ | **`HYPOTHESIS_LOW_FIT`** |
| **CASE-10** | Compatible / Aligned | $\Delta = 0$ (Exact) | $[0.00, 0.15)$ (Negligible) | 1 | 4 | $\min(1, 4) = 1$ | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-11** | Compatible / Aligned | $\Delta = 1$ (Moderate Gap) | $[0.00, 0.15)$ (Negligible) | 1 | 3 | $\min(1, 3) = 1$ | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-12** | Compatible / Aligned | $\Delta = 2$ (Severe Gap) | $[0.00, 0.15)$ (Negligible) | 1 | 2 | $\min(1, 2) = 1$ | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-13** | **Orthogonal Domain** | Any $\Delta \in \{0, 1, 2\}$ | $[0.80, 1.00]$ (High) | 4 | N/A | Overridden | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-14** | **Orthogonal Domain** | Any $\Delta \in \{0, 1, 2\}$ | $[0.45, 0.80)$ (Moderate) | 3 | N/A | Overridden | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-15** | **Orthogonal Domain** | Any $\Delta \in \{0, 1, 2\}$ | $[0.15, 0.45)$ (Low) | 2 | N/A | Overridden | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |
| **CASE-16** | **Orthogonal Domain** | Any $\Delta \in \{0, 1, 2\}$ | $[0.00, 0.15)$ (Negligible) | 1 | N/A | Overridden | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** |

##### 7. Candidate Assignment Order & Deterministic Tie-Breaks
To guarantee 100% bit-for-bit reproducibility:
1. **Ordering:** JDs are sorted lexicographically by ID (`JD-001` .. `JD-030`). Resumes are sorted lexicographically by ID (`RES-001` .. `RES-060`).
2. **Assignment Processing:** JDs are processed strictly in ascending index order $i = 1 \dots 30$. For each JD, Probe 1 ($P_{i,1}$) is assigned first, then Probe 2 ($P_{i,2}$) according to the Schedule in Section 9.3.4.
3. **Candidate Pool Management:** The candidate pool consists of all currently unassigned resumes. Once a resume is assigned to a pair, it is immediately removed from the candidate pool (enforcing strict zero resume reuse, $60 \times 1 = 60$).
4. **Deterministic Tie-Break Rules:** When multiple unassigned candidate resumes in the pool satisfy the required bucket $H$ for slot $P_{i,k}$:
   - **Tie-Break 1:** Highest exact canonical required skill overlap count $|K_{\text{RES}} \cap R_{\text{JD}}|$.
   - **Tie-Break 2:** Lowest absolute seniority delta $\Delta = |S_{\text{RES}} - S_{\text{JD}}|$.
   - **Tie-Break 3:** Lexicographically smaller `resume_id` (e.g., `RES-004` takes precedence over `RES-011`).

##### 8. Bucket Shortfall Handling
If the candidate pool lacks resumes satisfying a target hypothesis bucket:
- **Prohibited Behavior:** The sampler **must not** dynamically alter interval thresholds, relax seniority rules, or reclassify hypothesis buckets to force quota completion.
- **Remediation Protocol:** The sampler immediately terminates execution with non-zero exit code 1 and writes an explicit shortfall error log detailing the deficit to `dataset/reports/sampling_shortfall.log` (e.g., `DEFICIT: Need 2 additional RES in HYPOTHESIS_INTENTIONAL_MISMATCH for JD-025`). The research team must parameterize the deterministic synthesis generator (`scripts/dataset/generate_synthetic_profiles.py`) to synthesize profiles matching the exact missing criteria before re-running the sampler.

#### 9.3.4 Dual Contrasting Probes per JD (Exact $30 \times 2 = 60$ Schedule)
Every JD is assigned **exactly two contrasting candidate probes** ($P_{i,1}$ and $P_{i,2}$) to enable rigorous within-job pairwise candidate preference and ranking analysis:

| Job Range | Total JDs | Probe 1 ($P_{i,1}$) Target | Probe 2 ($P_{i,2}$) Target | Contrasting Pair Dynamics |
|---|:---:|:---:|:---:|---|
| **`JD-001` – `JD-010`** | 10 JDs | **`HYPOTHESIS_HIGH_FIT`** (10 pairs) | **`HYPOTHESIS_MODERATE_FIT`** (10 pairs) | High vs. Moderate (fine-grained qualification discrimination) |
| **`JD-011` – `JD-020`** | 10 JDs | **`HYPOTHESIS_HIGH_FIT`** (10 pairs) | **`HYPOTHESIS_LOW_FIT`** (10 pairs) | High vs. Low (clear hiring qualification contrast) |
| **`JD-021` – `JD-030`** | 10 JDs | **`HYPOTHESIS_MODERATE_FIT`** (10 pairs) | **`HYPOTHESIS_INTENTIONAL_MISMATCH`** (10 pairs) | Moderate vs. Total Mismatch (boundary noise vs. domain rejection) |

*Reconciled Pair Totals:*
- **`HYPOTHESIS_HIGH_FIT`**: $10 + 10 = 20 \text{ Pairs}$
- **`HYPOTHESIS_MODERATE_FIT`**: $10 + 10 = 20 \text{ Pairs}$
- **`HYPOTHESIS_LOW_FIT`**: $10 \text{ Pairs}$
- **`HYPOTHESIS_INTENTIONAL_MISMATCH`**: $10 \text{ Pairs}$
- **Total:** Exactly $20 + 20 + 10 + 10 = 60 \text{ Pairs}$.

#### 9.3.5 Human Label Independence & Matcher-Blinding Protocol
To guarantee that human annotations represent true independent ground truth:

1. **Randomized Presentation:** Human annotators evaluate evaluation pairs presented in a randomized sequence.
2. **Blinded Presentation View:** The pair annotation interface displays **exclusively**:
   - The normalized text of the Job Description (`JD-XXX`).
   - The normalized text of the candidate Resume (`RES-XXX`).
3. **Information Strictly Stripped from Annotators:**
   - The assigned hypothesis bucket (`expected_fit_hypothesis`).
   - The sampling rationale (`sampling_rationale`).
   - All production matching engine scores, skill match percentages, and algorithmic candidate rankings.
   - The annotations and Likert ratings of peer annotators (`ANN_A` vs `ANN_B`).
4. **Anchored 5-Point Likert Suitability Scale:**
   Annotators independently assign a suitability rating (`likert_suitability` 1–5) based on an anchored qualitative rubric:
   - **1 — Completely Unqualified:** Zero domain alignment; missing all critical prerequisites; would be immediately disqualified.
   - **2 — Minimally Qualified:** Severe skill deficits; fails major required criteria; would require prohibitive onboarding.
   - **3 — Marginally Qualified:** Borderline candidate; core technical foundation present but missing 1–2 key required technologies or seniority depth.
   - **4 — Well Qualified:** Strong domain and technical alignment; satisfies all essential required competencies.
   - **5 — Exceptionally Qualified:** Ideal candidate; satisfies all required and preferred competencies with ideal experience depth.
5. **Diagnostic Double-Annotation & Formal Adjudication:**
   - In the pilot, a diagnostic subset of at least 20 evaluation pairs is evaluated independently by both Annotator A and Annotator B.
   - When annotator ratings diverge ($|\text{score}_A - \text{score}_B| \ge 1$), the discrepancy is flagged for formal adjudication. A Senior Adjudicator reviews the textual evidence and records a consensus resolution in an `ADJ-XXX` record with written scientific rationale.

#### 9.3.6 Comprehensive Post-Hoc Ground-Truth Validation for All Four Buckets

To prevent circular reasoning, the pre-experimental hypothesis is compared against finalized human ground truth **only after all human annotations and adjudications are permanently locked**. 

Let $L \in \{1, 2, 3, 4, 5\}$ be the finalized human consensus Likert rating (derived from unanimous primary rating or resolved `ADJ-XXX` record). FairHire AI defines explicit validation, contradiction, and unresolved outcomes for **all four hypothesis buckets**:

| Hypothesis Bucket | Finalized Human Likert ($L$) | Outcome Status (`hypothesis_status`) | Explicit Interpretation & Adjudication Rule |
|---|:---:|:---:|---|
| **`HYPOTHESIS_HIGH_FIT`** | $L \in \{4, 5\}$ | `VALIDATED_BY_HUMAN_GROUND_TRUTH` | Evaluator consensus confirms candidate is Well or Exceptionally Qualified. |
| | $L \in \{1, 2\}$ | `CONTRADICTED_BY_HUMAN_GROUND_TRUTH` | Evaluator consensus reveals severe deficit; candidate is Unqualified or Minimally Qualified. |
| | $L = 3$ OR Deadlock | `UNRESOLVED_DISPUTED_GROUND_TRUTH` | Borderline suitability; neither confirms high competence nor severe mismatch; or annotator deadlock. |
| **`HYPOTHESIS_MODERATE_FIT`** | $L = 3$ | `VALIDATED_BY_HUMAN_GROUND_TRUTH` | Evaluator consensus confirms candidate is Marginally Qualified / borderline viability. |
| | $L \in \{1, 5\}$ | `CONTRADICTED_BY_HUMAN_GROUND_TRUTH` | Human ground truth demonstrates extreme fit (either complete failure $L=1$ or exceptional fit $L=5$). |
| | $L \in \{2, 4\}$ OR Deadlock | `UNRESOLVED_DISPUTED_GROUND_TRUTH` | Adjacent borderline ratings; or annotator deadlock. |
| **`HYPOTHESIS_LOW_FIT`** | $L = 2$ | `VALIDATED_BY_HUMAN_GROUND_TRUTH` | Evaluator consensus confirms candidate is Minimally Qualified with severe onboarding barriers. |
| | $L \in \{4, 5\}$ | `CONTRADICTED_BY_HUMAN_GROUND_TRUTH` | Ground truth proves candidate is actually Well or Exceptionally Qualified. |
| | $L \in \{1, 3\}$ OR Deadlock | `UNRESOLVED_DISPUTED_GROUND_TRUTH` | Candidate is completely disqualified ($L=1$) or marginally viable ($L=3$); or annotator deadlock. |
| **`HYPOTHESIS_INTENTIONAL_MISMATCH`** | $L = 1$ | `VALIDATED_BY_HUMAN_GROUND_TRUTH` | Evaluator consensus confirms candidate is Completely Unqualified (immediate domain rejection). |
| | $L \in \{3, 4, 5\}$ | `CONTRADICTED_BY_HUMAN_GROUND_TRUTH` | Candidate demonstrates unexpected viability ($L \ge 3$) despite orthogonal domain classification. |
| | $L = 2$ OR Deadlock | `UNRESOLVED_DISPUTED_GROUND_TRUTH` | Candidate exhibits slight unexpected skill transfer ($L=2$); or annotator deadlock. |

##### Rule Non-Malleability & Scientific Integrity Invariant
> [!CRITICAL]
> **Rule Non-Malleability Invariant (M-INV-01):**  
> All rating boundaries, interval thresholds, and validation rules specified above are **immutably frozen prior to annotation inspection**.  
> Researchers are strictly forbidden from modifying validation boundaries, shifting Likert thresholds, or reclassifying hypothesis buckets post-hoc after inspecting human annotations or matcher scores to artificially inflate validation percentages. Contradictions and unresolved cases must be transparently reported as empirical findings in `dataset/reports/quality_report_v0.1.0.md`.


### 9.4 Exploratory Pilot Inventory & Future Split Leakage Controls
1. **Pilot Inventory Only (`pilot_record_index.json`):** Phase 5A does **not** enforce train/test/benchmark splits. The 60 evaluation pairs and associated records are cataloged in `dataset/inventory/pilot_record_index.json`. This file represents an **inventory index**, not an evaluation split partition.
2. **Future Evaluation Split Principles:** When formal benchmark splits are designed in subsequent phases, cross-split data leakage must be strictly prevented using **Group-Based Partitioning**:
   - **Shared Entity Isolation:** All pairs referencing the same `job_id` or `resume_id` must reside on the same side of any split.
   - **Near-Duplicate Grouping:** Resumes or JDs identified as near-duplicates ($\text{Jaccard} \ge 0.85$) must be assigned to the identical split cluster.
   - **No Random Seed Leakage:** Random train/test splits with dynamic runtime seeds are prohibited. All splits must be declared as static, version-controlled JSON membership lists.

---

## 10. Validation, Schema Contract Verification & Quality Reporting

### 10.1 Two-Layer Validation Architecture & Operational Separation

To ensure software rigor and prevent invalid records from corrupting empirical research, FairHire AI decouples dataset verification into two distinct, complementary validation layers:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              LAYER 1: LOCAL / INTRA-RECORD JSON SCHEMA VALIDATION               │
│                  Standard Draft 2020-12 Engine (jsonschema Library)              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Validates isolated single-file syntax, structural layout, and primitive types │
│ • Enforces regex patterns: ^(SRC|JD|RES|PAIR|ANN|ADJ)-[0-9]{3}$ and SHA-256    │
│ • Enforces string bounds (minLength, maxLength) and numeric limits              │
│ • Enforces intra-record conditional bans via allOf + if/then:                   │
│   - Source approval invariants (reviewer, timestamp, storage, derived rights)   │
│   - Resume release clearance (direct IDs, residual risk review, clean audit)    │
│   - Annotation target consistency & conditional label prohibitions              │
│   - Adjudication record structure & target-specific consensus requirements      │
│ • Rejects undeclared fields via additionalProperties: false                     │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ PASSED (Syntax & Local Constraints Valid)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│           LAYER 2: RELATIONAL / CROSS-RECORD INTEGRITY VALIDATION               │
│                  Custom Python Dataset Validator (validate_dataset.py)           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Referential Foreign Keys: Traverses graph relationships across files          │
│   - JD/Resume -> source_manifest (asserts parent exists & status == "APPROVED") │
│   - Evaluation Pair -> JD and Resume (asserts both entities exist on disk)      │
│   - Annotation -> target JD/RES/PAIR (asserts target file exists on disk)       │
│   - Adjudication -> primary annotations (asserts ANN-XXX exist and match entity)│
│ • Cross-Record Approval & Rights Invariants:                                    │
│   - Asserts tracked entities belong to sources with storage permitted in repo   │
│   - Asserts public release resumes link to sources with public redistribution   │
│   - Asserts no normalized text exists for sources with derived text prohibited  │
│ • Cryptographic Hash Recomputation:                                             │
│   - Recomputes SHA-256 over normalized_text UTF-8 bytes vs recorded digest      │
│   - Asserts character_count == len(normalized_text)                             │
│   - Asserts private raw resume hashes are NOT leaked in public records          │
│ • Unicode Code-Point Offset Verification:                                       │
│   - Asserts target.normalized_text[char_start:char_end] == verbatim_text        │
│   - Verifies 0 <= char_start < char_end <= len(target.normalized_text)         │
│   - Tests astral non-BMP glyphs, combining diacritics, and technical symbols    │
│ • Adjudication Governance:                                                      │
│   - Asserts primary annotations target identical entity and different raters    │
│   - Asserts adjudicator ID is not identical to either primary annotator         │
│ • Duplicate & Leakage Auditing:                                                 │
│   - Asserts evaluation pair (job_id, resume_id) tuples are strictly unique      │
│   - Asserts MinHash near-duplicates (Jaccard >= 0.85) do not cross split bounds │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Test Suite Architecture & Verification Sub-Suites

To avoid mixing concerns, FairHire AI formally separates automated verification into **five independent test sub-suites**. Local single-record JSON Schema tests are strictly isolated from cross-record graph validators, filesystem isolation scanners, security/PII audit tools, and post-hoc hypothesis verification engines:

#### 10.2.1 Sub-Suite 1: Layer 1 JSON Schema Validation Tests (`test_schema_contracts.py`)
Executes isolated Draft 2020-12 schema validation (`jsonschema.validate()`) over individual JSON documents. Enforces syntax, primitive types, string length bounds, numeric intervals, regex patterns, and intra-record conditional constraints (`allOf` + `if`/`then`):

| Test ID | Target Schema | Test Scenario / Boundary Condition | Expected Outcome | Enforced Invariant / Rejection Mechanism |
|---|---|---|:---:|---|
| `TC-SCHEMA-01` | `source_manifest` | Valid approved open source (`storage_permission: "PERMITTED_IN_REPO"`, `repo_tracking: "PERMITTED_IN_REPO"`, `redistribution: "PUBLIC_REDISTRIBUTION_PERMITTED"`). | **PASS** | Valid schema structure. |
| `TC-SCHEMA-02` | `source_manifest` | Valid approved internal-only source (`storage_permission: "LOCAL_RESTRICTED_RESEARCH_ONLY"`, `repo_tracking: "LOCAL_ONLY_GIT_PROHIBITED"`, `redistribution: "NO_REDISTRIBUTION_INTERNAL_ONLY"`). | **PASS** | Valid internal-only state. |
| `TC-SCHEMA-02B` | `source_manifest` | Valid ephemeral source (`storage_permission: "EPHEMERAL_PROCESSING_ONLY"`, `approval_status: "PENDING"`, `repo_tracking: "LOCAL_ONLY_GIT_PROHIBITED"`, `redistribution: "NO_REDISTRIBUTION_INTERNAL_ONLY"`, `internal_eval: "INTERNAL_EVAL_PROHIBITED"`). | **PASS** | Valid ephemeral volatile state. |
| `TC-SCHEMA-02C` | `source_manifest` | Valid quarantined source (`storage_permission: "QUARANTINED_NO_STORAGE"`, `approval_status: "QUARANTINED"`, `normalization: "NORMALIZATION_PROHIBITED"`, `internal_eval: "INTERNAL_EVAL_PROHIBITED"`, `repo_tracking: "LOCAL_ONLY_GIT_PROHIBITED"`, `redistribution: "NO_REDISTRIBUTION_INTERNAL_ONLY"`, `derived_text: "PROHIBITED"`). | **PASS** | Valid quarantined isolation state. |
| `TC-SCHEMA-03` | `source_manifest` | Malformed source ID: `"SRC-1"` or `"SOURCE-001"` (must match `^SRC-[0-9]{3}$`). | **FAIL** | Pattern constraint violation. |
| `TC-SCHEMA-04` | `source_manifest` | `approval_status: "APPROVED"` but `approved_by` is missing or null. | **FAIL** | Conditional schema requires reviewer identity. |
| `TC-SCHEMA-05` | `source_manifest` | `approval_status: "APPROVED"` but `approval_date` is missing or invalid date-time. | **FAIL** | Conditional schema requires approval timestamp. |
| `TC-SCHEMA-06` | `source_manifest` | `approval_status: "APPROVED"` but `terms_of_service_evaluated: false`. | **FAIL** | Conditional schema requires verified ToS inspection. |
| `TC-SCHEMA-07` | `source_manifest` | `approval_status: "APPROVED"` but `storage_permission: "QUARANTINED_NO_STORAGE"`. | **FAIL** | Quarantined storage cannot be approved (`INV-STATE-02`). |
| `TC-SCHEMA-08` | `source_manifest` | `approval_status: "APPROVED"` but `storage_permission: "EPHEMERAL_PROCESSING_ONLY"`. | **FAIL** | Ephemeral storage cannot enter persistent pipeline (`INV-STATE-01`). |
| `TC-SCHEMA-08B` | `source_manifest` | `storage_permission: "EPHEMERAL_PROCESSING_ONLY"` but `repo_tracking_permission: "PERMITTED_IN_REPO"`. | **FAIL** | Ephemeral sources barred from Git tracking. |
| `TC-SCHEMA-08C` | `source_manifest` | `storage_permission: "EPHEMERAL_PROCESSING_ONLY"` but `internal_eval_permission: "INTERNAL_EVAL_PERMITTED"`. | **FAIL** | Ephemeral sources barred from internal evaluation. |
| `TC-SCHEMA-08D` | `source_manifest` | `storage_permission: "QUARANTINED_NO_STORAGE"` but `normalization_permission: "NORMALIZATION_PERMITTED"`. | **FAIL** | Quarantined sources cannot produce derived text (`INV-STATE-09`). |
| `TC-SCHEMA-08E` | `source_manifest` | `approval_status: "QUARANTINED"` but `storage_permission != "QUARANTINED_NO_STORAGE"`. | **FAIL** | Quarantined status forces quarantined storage boundary (`INV-STATE-08`). |
| `TC-SCHEMA-08F` | `source_manifest` | `approval_status: "PENDING"` but `repo_tracking_permission: "PERMITTED_IN_REPO"`. | **FAIL** | Unapproved sources cannot be tracked in Git (`INV-STATE-11`). |
| `TC-SCHEMA-09` | `source_manifest` | `approval_status: "APPROVED"` but `normalization_permission: "NORMALIZATION_PROHIBITED"`. | **FAIL** | Approved sources must permit normalization (`INV-STATE-03`). |
| `TC-SCHEMA-10` | `source_manifest` | `approval_status: "APPROVED"` but `internal_eval_permission: "INTERNAL_EVAL_PROHIBITED"`. | **FAIL** | Approved sources must permit internal evaluation (`INV-STATE-04`). |
| `TC-SCHEMA-11` | `source_manifest` | Incompatible rights: `repo_tracking_permission: "LOCAL_ONLY_GIT_PROHIBITED"` with `redistribution_permission: "PUBLIC_REDISTRIBUTION_PERMITTED"`. | **FAIL** | Public release requires Git tracking clearance (`INV-STATE-05`). |
| `TC-SCHEMA-12` | `source_manifest` | Incompatible rights: `redistribution_permission: "PUBLIC_REDISTRIBUTION_PERMITTED"` with `storage_permission: "LOCAL_RESTRICTED_RESEARCH_ONLY"`. | **FAIL** | Public redistribution requires repo storage clearance (`INV-STATE-06`). |
| `TC-SCHEMA-13` | `source_manifest` | `approval_status: "APPROVED"` but `legal_rationale_type: "UNVERIFIED_PENDING_REVIEW"`. | **FAIL** | Unverified legal rationale barred from approval. |
| `TC-SCHEMA-14` | `source_manifest` | `approval_status: "APPROVED"` but `permitted_collection_method: "UNVERIFIED_SCRAPE_QUARANTINED"`. | **FAIL** | Quarantined collection avenue barred from approval. |
| `TC-SCHEMA-15` | `job_description` | Valid normalized JD with character count $\ge 50$, valid domain, SHA-256 pattern. | **PASS** | Valid schema structure. |
| `TC-SCHEMA-16` | `job_description` | Malformed identifier (`"JOB-001"`) or character count $< 50$. | **FAIL** | Regex pattern or minLength violation. |
| `TC-SCHEMA-17` | `resume_record` | Valid public synthetic candidate profile (`release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`, clean audit, documented auditor). | **PASS** | Valid schema structure. |
| `TC-SCHEMA-18` | `resume_record` | Valid internal-only candidate profile (`release_eligibility: "RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY"`, clean audit, documented auditor). | **PASS** | Valid internal-only structure. |
| `TC-SCHEMA-19` | `resume_record` | `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"` but `direct_identifiers_removed: false`. | **FAIL** | Conditional schema invariant: public release requires direct ID removal. |
| `TC-SCHEMA-20` | `resume_record` | `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"` but `de_identification_status: "PENDING_AUDIT"`. | **FAIL** | Conditional schema invariant: public release requires residual risk audit. |
| `TC-SCHEMA-21` | `resume_record` | `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"` but `scrubbed_by` or `audit_timestamp` missing. | **FAIL** | Conditional schema requires documented auditor identity and timestamp. |
| `TC-SCHEMA-22` | `resume_record` | `release_eligibility: "QUARANTINED_HIGH_RISK"` but `quarantine_flag: false`. | **FAIL** | Conditional schema requires quarantine_flag: true. |
| `TC-SCHEMA-23` | `evaluation_pair` | Valid exploratory pair with rationale ($\ge 15$ chars) and valid hypothesis enum. | **PASS** | Valid schema structure. |
| `TC-SCHEMA-24` | `evaluation_pair` | Invalid hypothesis enum (e.g. attempting to insert numeric matcher score `"0.82"`). | **FAIL** | Enum membership constraint violation. |
| `TC-SCHEMA-25` | `annotation` | Target consistency: `EVALUATION_PAIR` requires `human_relevance_label` (bans skills/exclusionary); `JOB_DESCRIPTION` requires skill + exclusionary (bans relevance); `RESUME` requires skills (bans exclusionary/relevance); `matcher_score_blinded: false`. | **FAIL** | Conditional target schema prohibitions and blinding invariant. |
| `TC-SCHEMA-26` | `adjudication` | Adjudication record structure: `minItems: 2` primary annotation IDs, rationale $\ge 20$ chars, target-specific consensus blocks. | **FAIL** | minItems / minLength / conditional target violation. |

#### 10.2.2 Sub-Suite 2: Layer 2 Relational Integrity & Rights Invariant Tests (`validate_dataset.py`)
Validates multi-file relationships across the dataset graph, cryptographic content hashes, and cross-record rights consistency:

| Test ID | Verification Dimension | Test Scenario / Relational Assertion | Expected Outcome | Failure Condition / Validator Error |
|---|---|---|:---:|---|
| `TC-REL-01` | Referential Foreign Key | JD or Resume references a `source_id` that does not exist in `dataset/manifest.json`. | **FAIL** | Broken foreign key (`S-VAL-01`). |
| `TC-REL-02` | Source Approval Check | JD or Resume references a source with `approval_status != "APPROVED"` (`PENDING`, `REJECTED`, or `QUARANTINED`). | **FAIL** | Unapproved source referenced by downstream entity (`S-VAL-01`). |
| `TC-REL-03` | Storage Boundary Check | Entity belongs to source with `storage_permission == "LOCAL_RESTRICTED_RESEARCH_ONLY"`, but entity is tracked in Git. | **FAIL** | Restricted storage source committed to repository (`S-VAL-02`). |
| `TC-REL-03B` | Ephemeral / Quarantined Storage | Entity file exists on disk in `dataset/normalized/` or `dataset/raw/` for a source with `storage_permission == "EPHEMERAL_PROCESSING_ONLY"` or `"QUARANTINED_NO_STORAGE"`. | **FAIL** | Ephemeral or quarantined entity persisted to disk (`S-VAL-02`, `S-VAL-08`). |
| `TC-REL-04` | Normalization Permission | File in `dataset/normalized/` belongs to source with `normalization_permission == "NORMALIZATION_PROHIBITED"`. | **FAIL** | Normalized text exists for prohibited-normalization source (`S-VAL-03`). |
| `TC-REL-05` | Internal Eval Permission | `evaluation_pair` references entity belonging to source with `internal_eval_permission == "INTERNAL_EVAL_PROHIBITED"`. | **FAIL** | Entity barred from evaluation pairs (`S-VAL-04`). |
| `TC-REL-06` | Public Release Invariant | Resume has `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`, but parent source has `redistribution_permission == "NO_REDISTRIBUTION_INTERNAL_ONLY"` or `repo_tracking_permission == "LOCAL_ONLY_GIT_PROHIBITED"`. | **FAIL** | Internal-only approval cannot confer public release eligibility (`S-VAL-06`). |
| `TC-REL-07` | Cryptographic Digest | `normalized_text_sha256 != sha256(normalized_text.encode('utf-8'))`. | **FAIL** | SHA-256 cryptographic digest mismatch. |
| `TC-REL-08` | Character Count Audit | `character_count != len(normalized_text)`. | **FAIL** | Document length integrity check failure. |
| `TC-REL-09` | Linkability Safeguard | Public resume record in `dataset/normalized/resumes/` scanned for private raw document SHA-256 hash. | **PASS** / **FAIL** | PASS if hash absent; FAIL if raw document hash leaked in public record. |
| `TC-REL-10` | Unicode Code-Point Offsets | Evaluates string slice `normalized_text[char_start:char_end] == verbatim_text` across all labeled spans, including astral symbols ($\text{U+1F4BC}$), combining diacritics, and symbols (`C++`, `.NET`, `CI/CD`). | **PASS** / **FAIL** | PASS if exact code-point match; FAIL if character offset drift detected. |
| `TC-REL-11` | Pair Referential Integrity | `evaluation_pair` references `job_id` or `resume_id` missing from `dataset/normalized/`. | **FAIL** | Missing referenced target file on disk. |
| `TC-REL-12` | Pair Uniqueness | Exact duplicate `(job_id, resume_id)` tuple appears in more than one evaluation pair. | **FAIL** | Duplicate pair definition violation. |
| `TC-REL-13` | Adjudication Provenance | Referenced `primary_annotation_ids` target different documents, originate from the same annotator, or `adjudicator_id` matches one of the primary raters. | **FAIL** | Adjudication relational integrity conflict. |
| `TC-REL-14` | Adjudication Offset Check | Resolved label text slices match `target.normalized_text[char_start:char_end]` exactly. | **FAIL** | Resolved annotation offset drift. |
| `TC-REL-15` | Double-Annotation Quota | Asserts presence of independent double-annotations (`ANN_A` and `ANN_B`) for at least 10 JDs, 10 Resumes, and 20 Evaluation Pairs (minimum 80 double-blind records). | **PASS** / **FAIL** | PASS if all quotas satisfied; FAIL if double-annotation count falls below quota. |
| `TC-REL-16` | Discrepancy Adjudication | Asserts that 100% of detected primary annotation divergences across double-annotated JDs, Resumes, and Pairs have corresponding resolved `ADJ-XXX` records. | **PASS** / **FAIL** | PASS if all discrepancies resolved; FAIL if unresolved divergence exists without `ADJ-XXX`. |

#### 10.2.3 Sub-Suite 3: Layer 2 Filesystem, Path Isolation & Git Safety Tests (`verify_git_safety.py`)
Executes pre-commit and CI verification across all restricted paths, nested subdirectories, and version control boundaries:

| Test ID | Path / Boundary Tested | Test Scenario / Action Simulated | Expected Outcome | Enforced Gate / Protection Rule |
|---|---|---|:---:|---|
| `TC-GIT-01A` | `dataset/raw/jobs/*` | Staged direct file: `git add dataset/raw/jobs/sample_job.txt`. | **FAIL** (exit 1) | Raw job intake directory strictly gitignored. |
| `TC-GIT-01B` | `dataset/raw/jobs/**` (Nested) | Staged nested file: `git add dataset/raw/jobs/2026/batch1/sample_job.txt`. | **FAIL** (exit 1) | Recursive raw job path check blocks nested commits. |
| `TC-GIT-02A` | `dataset/raw/resumes/*` | Staged direct file: `git add dataset/raw/resumes/candidate.pdf`. | **FAIL** (exit 1) | Raw resume directory strictly gitignored. |
| `TC-GIT-02B` | `dataset/raw/resumes/**` (Nested) | Staged deeply nested file: `git add dataset/raw/resumes/dept/engineering/cv.docx`. | **FAIL** (exit 1) | Recursive raw resume path check blocks nested commits. |
| `TC-GIT-03A` | `dataset/quarantine/*` | Staged direct file: `git add dataset/quarantine/flagged_record.json`. | **FAIL** (exit 1) | Quarantine directory strictly gitignored. |
| `TC-GIT-03B` | `dataset/quarantine/**` (Nested) | Staged nested file: `git add dataset/quarantine/subfolder/flagged_record.json`. | **FAIL** (exit 1) | Recursive quarantine path check blocks nested commits. |
| `TC-GIT-04` | `dataset/temp/**` (Nested) | Staged nested file: `git add dataset/temp/extract/v1/scratch.txt`. | **FAIL** (exit 1) | Temporary scratch directory strictly gitignored. |
| `TC-GIT-05` | `dataset/.cache/**` (Nested) | Staged nested file: `git add dataset/.cache/lsh/index.bin`. | **FAIL** (exit 1) | Internal cache directory strictly gitignored. |
| `TC-GIT-06` | `dataset/donor_agreements/**` (Nested) | Staged nested file: `git add dataset/donor_agreements/signed/v1/consent.pdf`. | **FAIL** (exit 1) | Signed donor agreements strictly gitignored. |
| `TC-GIT-07` | `dataset/takedown_log.json` | Staged file: `git add dataset/takedown_log.json`. | **FAIL** (exit 1) | Private takedown and hash registry strictly gitignored. |
| `TC-GIT-08` | `dataset/normalized/resumes/**` | Staged file: candidate resume with `release_eligibility: "RESIDUAL_RISK_REVIEWED_INTERNAL_ONLY"` or `"NORMALIZED_PENDING_RISK_AUDIT"`. | **FAIL** (exit 1) | Staged-file scanner blocks unreleased or internal-only resume derivatives. |
| `TC-GIT-09A` | Binary Document Quarantine (Direct) | Staged binary file: `git add dataset/schemas/draft.pdf`. | **FAIL** (exit 1) | Universal ban on binary document commits. |
| `TC-GIT-09B` | Binary Document Quarantine (Nested) | Staged archive: `git add dataset/normalized/resumes/archive.tar.gz`. | **FAIL** (exit 1) | Universal ban on binary document commits. |
| `TC-GIT-10` | Legacy Fixtures Checksum Pinning | Asserts presence and SHA-256 digests of `dataset/raw/sample_jds.json` and `dataset/raw/sample_resumes/resume_1.txt..resume_4.txt`. | **PASS** | Pinned baseline test fixtures match cryptographic digests identically. |
| `TC-GIT-11` | Legacy Fixture Tampering Simulation | Simulated modification or deletion of `dataset/raw/sample_jds.json`. | **FAIL** (exit 1) | Security gate aborts CI run on legacy fixture tampering. |
| `TC-GIT-12` | PR Range Intermediate Deleted Blob | File committed in PR commit $C_1$ under restricted path (e.g., `dataset/raw/resumes/c1.pdf`) and subsequently deleted in $C_2$ (`--diff-filter=D`). | **FAIL** (exit 1) | PR revision range blob discovery inspects historical blob in $C_1$ and fails closed. |
| `TC-GIT-13` | PR Range Intermediate PII Blob | JSON file committed in PR commit $C_1$ containing candidate direct PII; subsequent commit modifies or clears file before PR tip. | **FAIL** (exit 1) | PR blob content scanner retrieves $C_1$ blob via `git cat-file`, detects PII, and blocks merge. |
| `TC-GIT-14` | PR Range Incomplete History / Shallow Clone | CI runner shallow clone (`git rev-parse --is-shallow-repository` true) or unretrievable blob object. | **FAIL** (exit 1) | Fail-closed security rule blocks execution on incomplete history or missing Git objects. |
| `TC-GIT-15A` | PR Merge Resolution Matching One Parent | PR merge commit resolves conflict by adopting parent version with restricted blob; verified that per-parent comparison (`git diff-tree -m`) detects it where combined diff `-c` would suppress it. | **FAIL** (exit 1) | Per-parent merge comparison prevents suppression of parent-derived restricted blobs. |
| `TC-GIT-15B` | PR Merge Evil Merge & Conflict Edits | PR merge commit introduces new restricted blob or candidate PII directly in merge conflict resolution. | **FAIL** (exit 1) | Per-parent diff inspects conflict resolution tree departures and fails closed. |
| `TC-GIT-15C` | NUL-Delimited Path Parsing for Whitespace/Newlines | Staged/committed paths contain spaces (e.g., `Senior Resume John Doe.pdf`), tabs, or embedded newlines; verifies NUL parsing preserves exact path without whitespace-splitting corruption. | **PASS** / **FAIL** (exit 1) | PASS if clean path; FAIL if space-containing path targets restricted directory. |
| `TC-GIT-15D` | Safe Blob Deduplication vs. Path Policy Enforcement | Identical blob SHA committed under allowed path and restricted path; asserts path policy check executes on both paths while expensive text/PII inspection is safely deduplicated. | **FAIL** (exit 1) | Path-specific policy violation blocked even when blob content is cached as clean. |
| `TC-GIT-16` | Git Type Change (`status: T`) Handling | Commit alters file mode/type (e.g., standard file `100644` replaced with symlink `120000` or submodule `160000`). Verified that omitting restrictive diff-filters captures `status: T` and executes mode/path policy checks. | **FAIL** (exit 1) | Type change to unsupported or prohibited mode triggers fail-closed block. |
| `TC-GIT-17` | Symbolic Link Policy Enforcement | Symbolic link committed inside `dataset/` (mode `120000`). Asserts universal symlink ban in dataset hierarchy blocks commit. | **FAIL** (exit 1) | Symlinks in dataset hierarchy strictly prohibited to prevent path-traversal leaks. |
| `TC-GIT-18` | Gitlink / Submodule Injection | Gitlink committed inside `dataset/` (mode `160000`, object type `commit`). Asserts gitlink is blocked immediately and never passed to blob scanner. | **FAIL** (exit 1) | Gitlinks/submodules prohibited; commit objects isolated from blob scanning. |
| `TC-GIT-19` | Non-Blob Git Object Assertion | Diff record references a commit or tree object where a blob was expected; `git cat-file -t <dst-sha>` returns non-blob type. Asserts scanner fails closed before blob content inspection. | **FAIL** (exit 1) | Object-type assertion blocks non-blob objects from entering blob scanner. |
| `TC-GIT-20` | Malformed / Unrecognized Diff Record or Invalid Mode | Raw diff record contains unrecognized status (e.g., `X`), unsupported file mode (e.g., `040000`), or fewer than 5 header fields. Asserts fail-closed parsing. | **FAIL** (exit 1) | Fail-closed parser aborts execution on any malformed or unexpected record. |
| `TC-GIT-21` | Target-Ref Resolution & Merge-Base Failure | CI target ref (`origin/${GITHUB_BASE_REF:-main}`) missing, ambiguous, unresolvable to commit, or `git merge-base` computation fails. Asserts pre-flight aborts CI run. | **FAIL** (exit 1) | Pre-flight ref validation prevents unanchored revision range scanning. |

> [!NOTE]
> **Pending Status Notice (Sub-Suite 3):**  
> All test cases in Sub-Suite 3 (`TC-GIT-01A/B` through `TC-GIT-21`) remain strictly **PLANNED AND PENDING**. Test names, design descriptions, and test case tables represent design specifications only and do **not** constitute evidence that tests have been implemented, executed, or passed. No test implementation or execution has occurred. Tests will be implemented and executed only after formal, explicit implementation authorization.


#### 10.2.4 Sub-Suite 4: Layer 2 PII Security Scanner & Fail-Closed Tests (`test_pii_scanner.py`)
Validates multi-format direct identifier detection, technical URL whitelisting, and fail-closed behaviors:

| Test ID | Target / Pattern Tested | Test Scenario / Payload | Expected Outcome | Detection Mechanism / Enforcement Action |
|---|---|---|:---:|---|
| `TC-PII-01` | Candidate Email | Normalized text contains email pattern (`candidate.name@email.com`). | **FAIL** (exit 1) | RFC 5322 regex match triggers commit block. |
| `TC-PII-02` | Telephone Number | Normalized text contains phone number (`+1 (555) 019-2834`, `020-7946-0912`, `9876543210`). | **FAIL** (exit 1) | E.164 and national phone regex triggers commit block. |
| `TC-PII-03` | Physical Street Address | Normalized text contains street descriptor and zip (`452 Elm Street, Suite 400, Seattle, WA 98101`). | **FAIL** (exit 1) | Street address pattern triggers commit block. |
| `TC-PII-04` | Identifying Vanity URL | Normalized text contains candidate profile handle (`linkedin.com/in/johndoe`, `twitter.com/johndoe`, `johndoe.dev`). | **FAIL** (exit 1) | Personal profile URL pattern triggers commit block. |
| `TC-PII-05` | Whitelisted Technical URLs | Normalized text contains official documentation or repo link (`github.com/facebook/react`, `docs.python.org/3/`, `spring.io`, `w3.org/TR/`, `doi.org/*`). | **PASS** (exit 0) | Technical whitelist recognizes non-identifying project evidence; preserves span. |
| `TC-PII-06` | Scanner Crash / Exception | Scanner encounters unhandled exception or runtime crash during parsing. | **FAIL** (exit 1) | **Fail-Closed Mandate:** Crash yields non-zero exit code 1; zero permissive fallback. |
| `TC-PII-07` | Unsupported / Corrupt Format | Scanner encounters corrupted file header, non-UTF-8 bytes, or unrecognized binary format. | **FAIL** (exit 1) | **Fail-Closed Mandate:** File blocked and isolated to `dataset/quarantine/`. |
| `TC-PII-08` | Inspection Timeout | Processing time exceeds 5000 ms on a single document stream. | **FAIL** (exit 1) | **Fail-Closed Mandate:** Timeout aborts execution with exit code 1. |
| `TC-PII-09` | Uncertain NER Finding | Automated NER entity extraction flags borderline suspect name with confidence $0.30 \le \text{conf} < 0.70$. | **FAIL** (exit 1) | **Fail-Closed Mandate:** Record quarantined with `quarantine_flag: true`; requires human review. |
| `TC-PII-10` | Fully Sanitized Document | Document contains zero PII, verified whitelisted technical links, clean manual audit sign-off. | **PASS** (exit 0) | Clean audit verification. |

#### 10.2.5 Sub-Suite 5: Layer 2 Hypothesis Sampling & Post-Hoc Validation Tests (`test_hypothesis_validation.py`)
Validates mathematical sampling determinism, zero matcher contamination, and all 16 decision table cases from Section 9.3.3:

| Test ID | Hypothesis Component Tested | Test Scenario / Assertion | Expected Outcome | Verification Logic & Adjudication Rule |
|---|---|---|:---:|---|
| `TC-HYP-01` | Zero Matcher Scoring | Asserts zero references to production matching engine classes or scores during pair generation. | **PASS** | Matcher engine blinding audit (`deterministic-v1` completely excluded). |
| `TC-HYP-02` | Skill Interval Boundaries | Evaluates interval boundaries: $C=0.800$ (High), $C=0.799$ (Moderate), $C=0.450$ (Moderate), $C=0.449$ (Low), $C=0.150$ (Low), $C=0.149$ (Mismatch). | **PASS** | Non-overlapping mathematical interval boundaries confirmed. |
| `TC-HYP-03` | Case 1: High Fit Exact | Compatible domain, $\Delta = 0$ (Seniority Match), $C = 0.90 \implies \min(4, 4) = 4$. | **PASS** | Assigns `HYPOTHESIS_HIGH_FIT`. |
| `TC-HYP-04` | Case 2: High Fit Moderate Gap | Compatible domain, $\Delta = 1$, $C = 0.90 \implies \min(4, 3) = 3$. | **PASS** | Seniority ceiling caps at `HYPOTHESIS_MODERATE_FIT`. |
| `TC-HYP-05` | Case 3: High Fit Severe Gap | Compatible domain, $\Delta = 2$ (Intern vs Lead), $C = 0.90 \implies \min(4, 2) = 2$. | **PASS** | Seniority ceiling caps at `HYPOTHESIS_LOW_FIT`. |
| `TC-HYP-06` | Case 4: Moderate Fit Exact | Compatible domain, $\Delta = 0$, $C = 0.60 \implies \min(3, 4) = 3$. | **PASS** | Assigns `HYPOTHESIS_MODERATE_FIT`. |
| `TC-HYP-07` | Case 5: Moderate Fit Moderate Gap | Compatible domain, $\Delta = 1$, $C = 0.60 \implies \min(3, 3) = 3$. | **PASS** | Assigns `HYPOTHESIS_MODERATE_FIT`. |
| `TC-HYP-08` | Case 6: Moderate Fit Severe Gap | Compatible domain, $\Delta = 2$, $C = 0.60 \implies \min(3, 2) = 2$. | **PASS** | Seniority ceiling caps at `HYPOTHESIS_LOW_FIT`. |
| `TC-HYP-09` | Case 7: Low Fit Exact | Compatible domain, $\Delta = 0$, $C = 0.30 \implies \min(2, 4) = 2$. | **PASS** | Assigns `HYPOTHESIS_LOW_FIT`. |
| `TC-HYP-10` | Case 8: Low Fit Moderate Gap | Compatible domain, $\Delta = 1$, $C = 0.30 \implies \min(2, 3) = 2$. | **PASS** | **Lower-Bucket Invariance:** Low skills never promoted to Moderate ($\min(2, 3) = 2$). |
| `TC-HYP-11` | Case 9: Low Fit Severe Gap | Compatible domain, $\Delta = 2$, $C = 0.30 \implies \min(2, 2) = 2$. | **PASS** | Assigns `HYPOTHESIS_LOW_FIT`. |
| `TC-HYP-12` | Cases 10–12: Mismatch Skills | Compatible domain, any $\Delta \in \{0, 1, 2\}$, $C = 0.08 \implies \min(1, C_{\Delta}) = 1$. | **PASS** | **Floor Invariance:** Negligible skills always yield `HYPOTHESIS_INTENTIONAL_MISMATCH`. |
| `TC-HYP-13` | Cases 13–16: Orthogonal Domain | Orthogonal domain (QA vs Data Science), $C = 0.95$, $\Delta = 0 \implies \text{Overridden}$. | **PASS** | **Domain Override:** Forces `HYPOTHESIS_INTENTIONAL_MISMATCH`. |
| `TC-HYP-14` | Dual Contrasting Probes | Asserts every JD $1 \dots 30$ appears in exactly 2 pairs representing contrasting hypotheses ($30 \times 2 = 60$). | **PASS** | Pairing schedule verified (JDs 1–10: High/Mod; 11–20: High/Low; 21–30: Mod/Mismatch). |
| `TC-HYP-15` | Zero Resume Reuse | Asserts all 60 resumes appear in exactly 1 pair ($60 \times 1 = 60$), with zero resumes appearing in $> 1$ pair. | **PASS** | 100% inventory utilization; zero cross-pair candidate reuse. |
| `TC-HYP-16` | Deterministic Tie-Breaks | Evaluates tie-breaking: highest skill overlap count, then lowest $\Delta$, then ascending `resume_id`. | **PASS** | Fully deterministic candidate selection confirmed. |
| `TC-HYP-17` | Bucket Shortfall Handling | Simulated candidate pool lacking target bucket causes sampler to abort with exit code 1. | **FAIL** (exit 1) | Shortfall halts execution; never loosens thresholds dynamically. |
| `TC-HYP-18` | High Fit Validation | `HYPOTHESIS_HIGH_FIT`: Likert 4,5 $\implies$ `VALIDATED`; Likert 1,2 $\implies$ `CONTRADICTED`; Likert 3 $\implies$ `UNRESOLVED`. | **PASS** | Explicit rating boundary verification for High Fit bucket. |
| `TC-HYP-19` | Moderate Fit Validation | `HYPOTHESIS_MODERATE_FIT`: Likert 3 $\implies$ `VALIDATED`; Likert 1,5 $\implies$ `CONTRADICTED`; Likert 2,4 $\implies$ `UNRESOLVED`. | **PASS** | Explicit rating boundary verification for Moderate Fit bucket. |
| `TC-HYP-20` | Low Fit Validation | `HYPOTHESIS_LOW_FIT`: Likert 2 $\implies$ `VALIDATED`; Likert 4,5 $\implies$ `CONTRADICTED`; Likert 1,3 $\implies$ `UNRESOLVED`. | **PASS** | Explicit rating boundary verification for Low Fit bucket. |
| `TC-HYP-21` | Mismatch Validation | `HYPOTHESIS_INTENTIONAL_MISMATCH`: Likert 1 $\implies$ `VALIDATED`; Likert 3,4,5 $\implies$ `CONTRADICTED`; Likert 2 $\implies$ `UNRESOLVED`. | **PASS** | Explicit rating boundary verification for Intentional Mismatch bucket. |
| `TC-HYP-22` | Rule Non-Malleability | Validates that all post-hoc validation rules evaluate identically before and after inspecting human ground truth. | **PASS** | Invariant `M-INV-01` confirmed. |


### 10.3 Quality Report Specification
Upon execution, an automated quality reporter script will generate `dataset/reports/quality_report_v0.1.0.md` detailing:
- Total record counts and completion percentage against pilot targets.
- Source breakdown (percentage synthetic, donated, public).
- Domain and experience distribution charts.
- Skill frequency distributions (most common required/preferred skills).
- Exclusionary language frequency by category.
- Inter-annotator agreement diagnostic report (Cohen's $\kappa$, Span F1, and confusion matrix).
- Duplicate check log (zero duplicates confirmed).
- PII audit sign-off timestamp.

---

## 11. Git Safety Controls & Multi-Layer Defense-in-Depth

Relying solely on `.gitignore` is fundamentally insufficient to guarantee that confidential resumes, unscrubbed PII, or restricted donor agreements are never committed to version control. FairHire AI implements an **enforceable multi-layer defense-in-depth architecture** that fails closed across all stages.

### 11.0 Fundamental Distinction: Advisory Ignore Rules vs. Enforceable Security Checks

To ensure uncompromising research security, FairHire AI formally establishes the distinction between advisory configuration, local client hooks, remote CI gates, and current planning-state boundaries:

1. **Current Planning Status (Unconfigured — Zero Active Guarantee Today):**  
   - In the current Phase 5A planning phase, **zero Git safety controls or scripts are active or authored**. The `.gitignore` rules, `.git/hooks/pre-commit` script, and CI workflow described below are **specifications for future implementation** during Step 1 and Step 3 upon formal human sign-off.
   - An unconfigured CI design provides **zero active guarantee**. Post-implementation guarantees depend strictly on platform-level branch-protection provisioning.

2. **Advisory `.gitignore` Rules (Layer 1 — Zero Guarantee):**  
   - Patterns defined in `.gitignore` are **purely advisory developer conveniences** designed to reduce noise in `git status`.  
   - **Zero Enforceable Security Boundary:** `.gitignore` does **not** guarantee files remain out of version control:
     - Any contributor can force-add an ignored file using `git add -f`.
     - Files staged or tracked prior to rule definition remain in the repository index.
     - Non-recursive globs (e.g., `*` vs `**`) leave nested subdirectories completely exposed.
     - `.gitignore` cannot inspect file content, evaluate PII, inspect JSON schema fields, or detect binary payloads.

3. **Local Pre-Commit Hook (Layer 2 — Local Enforceable, Client-Side):**  
   - Executes `.git/hooks/pre-commit` locally on every commit, scanning staged files (`git diff --cached --name-only`).  
   - **Enforcement Scope:** Intercepts accidental commits of restricted paths, nested subdirectories, binary documents, and unreleased normalized resume derivatives (`release_eligibility != "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`).  
   - **Bypass Limitation:** Because it executes client-side, it can be bypassed locally by a developer using `git commit --no-verify`. It is therefore a high-confidence local developer guardrail, not an absolute perimeter.

4. **Remote CI/CD Pipeline Gate (Layer 3 — Qualified Remote Enforcement):**  
   - Executes `python scripts/dataset/verify_git_safety.py --ci` on remote pull requests across protected repository branches.  
   - **Mandatory Platform Prerequisites for CI Guarantee:** Remote CI becomes an enforceable, non-bypassable perimeter **only if and when** all of the following platform repository settings are explicitly enabled:
     1. *Branch Protection Enabled:* Active branch protection rule configured on `main` (and release branches).
     2. *Mandatory Required Status Check:* The `verify_git_safety.py --ci` job is marked as a required check that must pass before merging.
     3. *Direct Push Blocked:* "Require a pull request before merging" is enforced (direct pushes to `main` prohibited).
     4. *Administrator Bypass Prohibited:* "Do not allow bypassing the above settings" / "Include administrators" is checked (preventing repository owners/admins from bypassing checks).
     5. *Up-to-Date Branch Requirement:* "Require branches to be up to date before merging" is enabled to prevent merging on stale test results.
   - **Bypass Assumptions & Limitations:** If repository administrators retain bypass rights, if branch protection is misconfigured, or if emergency bypass procedures are invoked, CI does not provide an absolute guarantee.
   - **Fail-Closed Behavioral Invariant:** Any violation, scanner crash, timeout (> 5000 ms), corrupt file, or uncertain NER finding ($0.30 \le \text{confidence} < 0.70$) **fails closed with exit code 1**, permanently blocking the merge.

5. **Current Index Auditing vs. Multi-Commit PR Range Blob Inspection vs. Deep History Scope:**  
   - **Current Index Auditing (`git ls-files`):** `git ls-files` inspects **strictly the current index / working tree at the tip of the branch**, NOT historical commits. A clean `git ls-files` check confirms the branch tip is clean, but cannot detect whether sensitive files were committed in an earlier commit on the branch.
   - **PR Revision-Range Blob & Content Inspection (In Scope for Phase 5A CI):** A simple `git log --name-only` check only reports file paths and does not inspect blob contents. To prevent bypasses where restricted resume data, unreleased derivatives, binary payloads, or unscrubbed PII are committed in intermediate commits (even if deleted before the PR tip, leaving accessible blobs in Git history), the CI script implements a comprehensive **Git Blob Content Inspection Architecture** (detailed in Section 11.3.2). The scanner enumerates all newly introduced and modified blobs in `MERGE_BASE..HEAD`, retrieves their contents via `git cat-file`, inspects their text and headers, and fails closed if any prohibited content or restricted path is detected.
   - **Explicit Scope Limitation — No Claim of Clean Historical Repository:** PR-range scanning inspects strictly the revisions introduced in the active pull request. It does **not** establish or prove that the entire historical repository (from the initial commit to the merge-base) is clean. FairHire AI makes **no claim that the historical repository is clean**, because no comprehensive history audit (e.g., Gitleaks, Trufflehog, or BFG across legacy commits) has actually been performed and no audit evidence has been recorded. Deep historical repository scanning across all past commits is an **explicitly out-of-scope archival/audit task** for Phase 5A dataset ingestion planning. If an institutional audit of historical commits is required, it must be commissioned as a separate operational task with recorded evidence. If a leakage incident ever occurs, Section 5.4 mandates deep repository history scrubbing with `git filter-repo`.

### 11.1 Layer 1: Exhaustive Restricted Path Enumeration & Recursive `.gitignore` Specification

Every restricted directory, temporary cache, and sensitive registry is explicitly enumerated with **recursive globbing (`**`)** in `.gitignore`:

1. `dataset/raw/jobs/**` (Raw scraped or submitted job description source files, including all nested batches)
2. `dataset/raw/resumes/**` (Raw candidate resume uploads in PDF, DOCX, TXT, including all nested subdirectories)
3. `dataset/quarantine/**` (Quarantined records, disputed data, leakage suspects)
4. `dataset/temp/**` (Intermediate extraction drafts, temporary OCR/text artifacts)
5. `dataset/.cache/**` (Internal index caches, temporary LSH hash tables)
6. `dataset/donor_agreements/**` (Signed donor consent agreements, identity logs)
7. `dataset/takedown_log.json` (Private withdrawal registry and internal document hashes)
8. **Restricted Derivatives:** Any resume file in `dataset/normalized/resumes/` where `release_eligibility != "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`
9. **Universal Binary Prohibition:** Document binary extensions (`*.pdf`, `*.docx`, `*.doc`, `*.rtf`, `*.bin`, `*.zip`, `*.tar`, `*.gz`) anywhere within `dataset/`

```gitignore
# =========================================================================
# Research Dataset Isolation (Phase 5A)
# =========================================================================
# 1. Quarantine raw input source directories (recursive coverage)
dataset/raw/jobs/**
dataset/raw/resumes/**
!dataset/raw/sample_jds.json
!dataset/raw/sample_resumes/**

# 2. Quarantine donor agreements, takedown registries, and quarantined data
dataset/donor_agreements/**
dataset/quarantine/**
dataset/takedown_log.json

# 3. Exclude scratch evaluation scripts and temporary caches
dataset/.cache/**
dataset/temp/**

# 4. Universal ban on binary document formats across entire dataset tree
dataset/**/*.pdf
dataset/**/*.docx
dataset/**/*.doc
dataset/**/*.rtf
dataset/**/*.bin
dataset/**/*.zip
dataset/**/*.tar
dataset/**/*.tar.gz
dataset/**/*.gz
```

### 11.2 Layer 2: Pre-Commit Staged-File Security Hook (`.git/hooks/pre-commit`)

A deterministic staged-file scanner blocks commits containing restricted paths, raw file extensions, PII patterns, restricted resume derivatives, or legacy fixture tampering. Critically, the scanner **fails closed** (exit 1) on any scanner crash, timeout, unsupported file format, or uncertain NER finding:

```bash
#!/usr/bin/env bash
# FairHire AI - Pre-Commit Git Safety Gate (Fail-Closed Architecture)
set -eo pipefail

echo "[FairHire AI] Running pre-commit dataset security check..."

# 1. Block any staged file inside restricted raw upload paths (recursive)
# Excludes pinned legacy fixtures: sample_jds.json and sample_resumes/**
STAGED_RAW=$(git diff --cached --name-only | grep -E '^dataset/raw/(jobs|resumes)/' || true)
if [ -n "$STAGED_RAW" ]; then
    echo "❌ ERROR: Attempting to commit restricted raw dataset files:"
    echo "$STAGED_RAW"
    echo "Raw resumes and JDs must NEVER be committed to Git. Commit aborted."
    exit 1
fi

# 2. Block any staged quarantine, donor agreement, temporary, or cache files (recursive)
STAGED_RESTRICTED=$(git diff --cached --name-only | grep -E '^dataset/(quarantine|donor_agreements|temp|\.cache)/|^dataset/takedown_log\.json$' || true)
if [ -n "$STAGED_RESTRICTED" ]; then
    echo "❌ ERROR: Attempting to commit restricted internal research files:"
    echo "$STAGED_RESTRICTED"
    exit 1
fi

# 3. Block any staged binary documents in dataset/ (recursive)
STAGED_DOCS=$(git diff --cached --name-only | grep -E '^dataset/.*\.(pdf|docx|doc|rtf|bin|zip|tar|gz)$' || true)
if [ -n "$STAGED_DOCS" ]; then
    echo "❌ ERROR: Attempting to commit binary document files into dataset/:"
    echo "$STAGED_DOCS"
    exit 1
fi

# 4. Execute deep Python PII, eligibility, and derivative scanner on staged JSON files (FAIL-CLOSED)
python scripts/dataset/verify_git_safety.py --staged || {
    echo "❌ FATAL: Security scanner failed closed. Commit aborted."
    exit 1
}

echo "✅ [FairHire AI] Pre-commit security check PASSED."
exit 0
```

### 11.3 Layer 3: CI/CD Pipeline Security Gate & SHA-256 Pinned Fixture Protection

The automated GitHub Actions / GitLab CI workflow executes `python scripts/dataset/verify_git_safety.py --ci` on every pull request.

#### 11.3.1 Pinned Legacy Fixture Integrity Check
To ensure legacy fixtures are never modified or deleted, `verify_git_safety.py` pins the relative paths and cryptographic SHA-256 digests of existing baseline test fixtures:
- `dataset/raw/sample_jds.json`
- `dataset/raw/sample_resumes/resume_1.txt`
- `dataset/raw/sample_resumes/resume_2.txt`
- `dataset/raw/sample_resumes/resume_3.txt`
- `dataset/raw/sample_resumes/resume_4.txt`

If any legacy fixture is missing, renamed, or produces a modified SHA-256 checksum, the CI security gate throws a fatal error and terminates with exit code 1.

#### 11.3.2 PR Revision-Range Blob Discovery & Content Inspection Architecture

Relying solely on `git log --name-only --diff-filter=A origin/main..HEAD` is fundamentally insufficient because it only inspects file paths at commit boundaries and completely ignores blob contents. Furthermore, if a contributor commits a restricted raw resume, binary payload, or candidate PII in an intermediate commit $C_1$ and subsequently deletes it in commit $C_2$, working-tree scans at the branch tip (`git ls-files`) report clean, while the sensitive Git blob object remains permanently accessible within the repository's Git object store.

To eliminate this vulnerability, `verify_git_safety.py --ci` implements a deterministic, fail-closed **Two-Phase Git Blob Content Inspection Protocol**:

##### 1. Baseline Selection & Target-Ref Resolution Architecture
In CI environments (e.g., GitHub Actions, GitLab CI), the target branch reference (`origin/main` or `origin/${GITHUB_BASE_REF}`) may not be fetched by default or may point to an ambiguous or shallow reference. The scanner executes an explicit target-ref pre-flight resolution protocol before computing the revision range:

```bash
# 1. Determine target branch and remote tracking reference
TARGET_BRANCH="${GITHUB_BASE_REF:-main}"
TARGET_REF="origin/${TARGET_BRANCH}"

# 2. Fetch remote target reference to ensure tracking ref exists locally
git fetch origin "${TARGET_BRANCH}":"refs/remotes/origin/${TARGET_BRANCH}" --depth=0 || {
    echo "❌ FATAL: Failed to fetch target branch ${TARGET_BRANCH} from remote origin."
    exit 1
}

# 3. Verify target ref resolves unambiguously to a valid commit object
git rev-parse --verify --quiet "${TARGET_REF}^{commit}" >/dev/null || {
    echo "❌ FATAL: Target ref ${TARGET_REF} is missing or does not resolve to an unambiguous commit."
    exit 1
}

# 4. Compute merge base against HEAD
MERGE_BASE=$(git merge-base "${TARGET_REF}" HEAD) || {
    echo "❌ FATAL: Unable to compute merge base between ${TARGET_REF} and HEAD."
    exit 1
}

# 5. Fail-closed on empty or unresolvable merge base
if [ -z "$MERGE_BASE" ]; then
    echo "❌ FATAL: Merge base is empty. Branch histories may be completely disconnected."
    exit 1
fi
```
- **Revision Range:** The commit range to audit is strictly `MERGE_BASE..HEAD`.
- **Fail-Closed on Unresolvable Base:** If the target ref is missing, ambiguous, disconnected, or `git merge-base` fails, the scanner **fails closed with exit code 1**.

##### 2. Two-Phase Commit & Tree Diff Traversal Architecture
Rather than executing a single heuristic command that risks silently skipping merge commits or misclassifying renames, the scanner separates ordinary single-parent commit traversal from multi-parent merge commit tree comparison:

###### Phase 1: Ordinary (Single-Parent) Commit Traversal
1. Enumerate all non-merge commits in the PR revision range:
   ```bash
   ORDINARY_COMMITS=$(git rev-list --no-merges ${MERGE_BASE}..HEAD)
   ```
2. For each commit $C \in \text{ORDINARY\_COMMITS}$, inspect all tree modifications against its single parent without rename heuristics:
   ```bash
   git diff-tree -r -z --raw --no-commit-id --no-renames $C
   ```
   > [!IMPORTANT]
   > **Prohibition of Restrictive `--diff-filter=AMD`:**  
   > Restrictive flags like `--diff-filter=AMD` are strictly prohibited because they silently suppress Git type-change events (`status: T`, e.g., a standard file replaced by a symlink or submodule). By omitting `--diff-filter`, Git raw diff emits all status records (`A`, `M`, `D`, `T`), which are processed deterministically by the raw diff parsing engine.

###### Phase 2: Merge (Multi-Parent) Commit Traversal & Per-Parent Tree Comparison
1. Enumerate all merge commits in the PR revision range:
   ```bash
   MERGE_COMMITS=$(git rev-list --merges ${MERGE_BASE}..HEAD)
   ```
2. **Deficiency of Combined Diff (`-c` / `--cc`) for Security Auditing:**  
   Git's combined diff (`-c` or `--cc`) was engineered for interactive code review to highlight conflicting files where the merge result differs from *all* parents. It explicitly **suppresses** any file whose merge resolution matches *any* parent commit ($T(M) == T(P_i)$).  
   - *Security Failure Mode:* If a contributor merges a branch where parent $P_2$ contains a restricted raw resume, an unreleased internal derivative, or candidate PII, and the merge resolution adopts parent $P_2$'s version (or if parent $P_1$ had no changes to that file), combined diff `-c` **completely omits the file from the diff output**.  
   - Consequently, claiming combined diff `-c` guarantees complete merge-resolution coverage is technically false and introduces an unacceptable data-leakage vulnerability.

3. **Per-Parent Tree Comparison Specification:**  
   To guarantee exhaustive coverage of all merge-result changes, the scanner compares the resulting tree $T(M)$ of each merge commit $M$ against **each parent commit $P_i$ individually**.  
   For each merge commit $M \in \text{MERGE\_COMMITS}$ with $k \ge 2$ parents ($P_1, \dots, P_k$):
   ```bash
   git diff-tree -r -z --raw --no-commit-id --no-renames -m $M
   ```
   (or iteratively over each parent $P_i \in \text{git rev-parse } M\text{\textasciicircum@}$ via `git diff-tree -r -z --raw --no-commit-id --no-renames $P_i $M`).
   - When `-m` is supplied to `git diff-tree`, Git emits a discrete raw diff stream for each parent: $P_1 \rightarrow M$, $P_2 \rightarrow M$, $\dots$, $P_k \rightarrow M$.
   - Each per-parent comparison extracts the exact destination blob hash `<dst-sha>` and relative `<path>` for tree state $T(M)$.
   - Every file modified, added, deleted, or type-changed relative to *any* parent is extracted and processed.

4. **Why Each-Parent Comparisons Guarantee Complete Merge Coverage:**  
   - **Resolution Matching One Parent ($T(M) == T(P_1) \land T(M) \neq T(P_2)$ or vice versa):**  
     If parent $P_2$ introduces a restricted file and the merge resolution accepts it ($T(M) == T(P_2)$), comparing $M$ against parent $P_1$ ($P_1 \rightarrow M$) emits the file with status `A` or `M` and destination blob `<dst-sha>` ($T(M)$). The scanner captures and inspects the blob. Combined diff `-c` would have silently dropped this file.  
   - **Conflict Resolution Edits / Evil Merges ($T(M) \neq T(P_1) \land T(M) \neq T(P_2)$):**  
     If the committer manually edits a conflicting file during merge resolution (introducing new text, PII, or structure present in neither parent), *both* $P_1 \rightarrow M$ and $P_2 \rightarrow M$ emit the file with destination blob `<dst-sha>` ($T(M)$). The new blob is extracted and inspected.  
   - **Clean Three-Way Merge:**  
     If a file was modified cleanly only on branch $P_2$ and merged without conflict into $P_1$, the resulting tree $T(M)$ differs from $P_1$. Comparison $P_1 \rightarrow M$ emits the change with `<dst-sha>`, ensuring the resulting merged tree at the merge commit is verified.  
   - **No Change Across Either Branch ($T(M) == T(P_1) == T(P_2)$):**  
     The file is identical in all parents and the merge commit; neither parent comparison emits it, correctly skipping redundant verification of untouched files.

##### 3. Raw Diff Parsing Engine & Fail-Closed State Machine
Git's `--raw -z` format emits records structured as:
`:<src-mode> <dst-mode> <src-sha> <dst-sha> <status>\0<path>\0`

###### A. Object Modes and State Machine Specification
The scanner processes all emitted modes and status codes through a rigorous state machine:
- **Supported Git Modes:**
  - `000000`: Uncreated (in status `A`) or Deleted (in status `D`).
  - `100644`: Standard non-executable regular file (normal blob).
  - `100755`: Executable regular file (blob). *Policy:* Executable files inside `dataset/` are strictly prohibited.
  - `120000`: Symbolic link (blob containing symlink target path). *Policy:* Symlinks inside `dataset/` are strictly prohibited.
  - `160000`: Gitlink / Submodule (commit object). *Policy:* Gitlinks inside `dataset/` are strictly prohibited.
  - *Any Other Mode:* Immediately triggers a fail-closed block (**exit code 1**).

- **Status Code Transitions under `--no-renames`:**
  - **`A` (Addition):** `<src-mode>` must be `000000` and `<src-sha>` must be null (`0000000...`). `<dst-mode>` must be valid (`100644`). Destination object is validated as type `blob` and queued for deep content inspection.
  - **`M` (Modification):** Both `<src-mode>` and `<dst-mode>` must be valid (`100644`). Destination object is validated as type `blob` and queued for deep content inspection.
  - **`D` (Deletion):** `<dst-mode>` must be `000000` and `<dst-sha>` must be null (`0000000...`). Content retrieval is skipped, but `<path>` is immediately verified against legacy fixture protection rules.
  - **`T` (Type Change):** `<src-mode>` $\neq$ `<dst-mode>`. The path is checked against legacy fixture protection and restricted paths. `<dst-mode>` is validated; if `<dst-mode>` is `120000` (symlink), `160000` (gitlink), or `100755` (executable) inside `dataset/`, the scanner immediately fails closed. If `<dst-mode>` is `100644`, `<dst-sha>` is verified as `blob` and queued for inspection.
  - **Unrecognized Status Codes:** Any status other than `A`, `M`, `D`, `T` (e.g., `C`, `R`, `U`, `X`, `?`) indicates a corrupted diff or unexpected Git state $\implies$ **FAIL CLOSED (exit 1)**.

###### B. Malformed Record Defense
The parser enforces strict structural assertions on every record:
1. Header line must split into exactly 5 whitespace-separated fields.
2. `<src-sha>` and `<dst-sha>` must each be exactly 40 hexadecimal characters.
3. Path token must be non-empty and bounded by NUL bytes.
4. Any parsing anomaly, field count divergence, or desynchronization triggers an immediate fatal error (**exit code 1**).

###### C. NUL Parsing & Shell Portability Boundaries
- **Prohibition of Ordinary Shell Loops:** Standard shell loops (`for item in $(...)`, `while read line`, or unquoted variable expansion) word-split on ASCII whitespace (spaces, tabs, newlines). If a filename contains spaces (e.g., `dataset/raw/resumes/John Doe Resume.pdf`) or embedded newlines, word-splitting fragments the file path into invalid tokens, corrupting path detection and failing to inspect the target blob. Furthermore, standard POSIX shells cannot hold raw NUL bytes (`\0`) in string variables.
- **Normative Python Architecture (`verify_git_safety.py`):**  
  The Python scanner reads Git's stdout as a raw `bytes` stream and splits strictly on `b'\0'`. This is the **normative, preferred, cross-platform implementation** across Windows, Linux, and macOS:
  ```python
  # Normative Python binary-safe parsing of raw NUL-delimited diff-tree output
  raw_bytes = subprocess.run(
      ["git", "diff-tree", "-r", "-z", "--raw", "--no-commit-id", "--no-renames", "-m", commit_sha],
      capture_output=True, check=True
  ).stdout

  tokens = raw_bytes.split(b'\0')
  idx = 0
  while idx + 1 < len(tokens):
      header_bytes = tokens[idx]
      path_bytes = tokens[idx + 1]
      idx += 2
      if not header_bytes:
          continue
      
      header_str = header_bytes.decode('utf-8', errors='surrogateescape').strip()
      file_path = path_bytes.decode('utf-8', errors='surrogateescape')
      
      if not file_path:
          raise ValueError(f"FATAL: Empty path token encountered in commit {commit_sha}")
      
      parts = header_str.split()
      if len(parts) != 5:
          raise ValueError(f"FATAL: Malformed diff-tree header: '{header_str}'")
      
      src_mode = parts[0].lstrip(':')
      dst_mode = parts[1]
      src_sha = parts[2]
      dst_sha = parts[3]
      status = parts[4]
      
      # Process record through fail-closed state machine
      process_diff_record(file_path, status, src_mode, dst_mode, src_sha, dst_sha)
  ```
- **Bash 4.0+ Alternative (Non-POSIX; Requires GNU Bash Extensions):**  
  If implemented in bash, strict NUL delimiter mode `-d ''` with `IFS=` must be used. Note that `< <(...)` process substitution and `read -d ''` are GNU Bash extensions and are **not portable to standard POSIX `/bin/sh`** (such as Dash):
  ```bash
  # Bash 4.0+ only (Non-POSIX). In POSIX /bin/sh, invoke python verify_git_safety.py directly.
  while IFS= read -r -d '' header && IFS= read -r -d '' filepath; do
      [ -z "$header" ] && continue
      # header contains :src-mode dst-mode src-sha dst-sha status
      # filepath preserves exact whitespace, tabs, and newlines without splitting
      ...
  done < <(git diff-tree -r -z --raw --no-commit-id --no-renames -m "$COMMIT")
  ```

##### 4. Git Object Type Validation & Mode Security Policies
`git cat-file -e <dst-sha>` proves object existence in the repository object store, but does **not** prove that the object is a blob. Commits, trees, and tags also exist as valid Git objects. Passing a non-blob object to a blob scanner can cause crashes, unexpected parsing errors, or silent security bypasses.

Before any content retrieval or deep scanning, the scanner performs explicit object-type verification:
```python
# Validate object type before blob content retrieval
obj_type = subprocess.run(
    ["git", "cat-file", "-t", dst_sha],
    capture_output=True, text=True, check=True
).stdout.strip()
```

###### A. Gitlink / Submodule Security Policy (`dst-mode == 160000`, `obj_type == "commit"`)
- In Git, submodules (gitlinks) are recorded in trees as entries with mode `160000` pointing to a `commit` object, not a `blob`.
- **Prohibition:** FairHire AI research dataset architecture employs zero Git submodules. Any gitlink entry committed inside `dataset/` represents an unauthorized external reference or submodule injection attack.
- **Safety Rule:** Commit objects must **never** be passed to the blob content scanner. If `<dst-mode>` is `160000` or `obj_type == "commit"`, the scanner:
  1. Blocks the entry immediately.
  2. Emits a fatal diagnostic: `FATAL: Gitlink/submodule detected at <path>. Submodules are strictly prohibited.`
  3. **Fails closed with exit code 1**.

###### B. Symbolic Link Security Policy (`dst-mode == 120000`, `obj_type == "blob"`)
- In Git, symbolic links are recorded with mode `120000` as a `blob` containing the symlink target path string.
- **Vulnerability:** Symlinks in research datasets present severe path-traversal vulnerabilities (e.g., a symlink `dataset/normalized/resumes/leak.json -> ../../raw/resumes/real_candidate.pdf` or `-> /etc/passwd`).
- **Policy: Universal Ban on Symbolic Links inside `dataset/`:**  
  Any entry within `dataset/` bearing mode `120000` is strictly prohibited. The scanner:
  1. Detects `dst-mode == 120000` on any path under `dataset/`.
  2. Emits a fatal diagnostic: `FATAL: Symbolic link detected in dataset hierarchy at <path>. Symlinks are strictly prohibited.`
  3. **Fails closed with exit code 1**.
- If symlinks are encountered outside `dataset/`, the target path string is read from the blob and asserted to never reference or resolve into `dataset/**`.

###### C. Regular File Validation (`dst-mode == 100644`)
- Asserts `obj_type == "blob"`. If `obj_type != "blob"`, fails closed with exit code 1.
- Retrieves blob content via `git cat-file -p <dst-sha>` and executes deep PII/binary inspection.

##### 5. Decomposed Rename, Copy, and Deletion Event Handling (`--no-renames` Strategy)
The scanner enforces `--no-renames` across all `diff-tree` invocations, deliberately bypassing Git's internal rename and copy heuristics (`-M`, `-C`):
- **Why Rename Heuristics are Excluded:** Git's similarity matching (e.g. 50% text overlap threshold) and `diff.renameLimit` configurations can fail on heavily modified files or large diffs, risking uninspected paths.
- **Decomposed Event Strategy:** Under `--no-renames`, Git deterministically models renames and copies as fundamental addition/deletion primitives:
  - **Renames (`pathA` $\rightarrow$ `pathB`):** Git deterministically emits two separate atomic records:
    1. *Deletion (`status: D`, `dst-sha: 0000000...`):* Source path check asserts `pathA` does not match any pinned legacy fixture (`dataset/raw/sample_jds.json` or `dataset/raw/sample_resumes/resume_1.txt..resume_4.txt`).
    2. *Addition (`status: A`, `dst-sha: <shaB>`):* Destination path check asserts `pathB` does not match any restricted path pattern (`dataset/raw/resumes/**`, etc.) or binary extensions. Destination blob `<shaB>` is queued for content inspection.
  - **Copies (`pathA` $\rightarrow$ `pathB`):** Modeled as an Addition event (`status: A`) on `pathB` with `<shaB>`. Both `pathB` and blob `<shaB>` are fully audited.
  - **Deletions (`status: D`):** `<dst-sha>` is all zeros (`0000000...`). The scanner skips blob content retrieval for null SHA, but immediately executes path-level validation to ensure no pinned legacy fixture was removed. Deleting a restricted path does not clear intermediate commits where it was added.
  - **Missing Git Objects:** Before retrieving blob contents, the scanner verifies object presence via `git cat-file -e <dst-sha>`. If an object is missing or unretrievable (e.g., corrupt repository, broken pointer, shallow clone), the scanner **fails closed with exit code 1**.

##### 6. Safe Blob Content Deduplication vs. Mandatory Path Policy Enforcement
The scanner strictly decouples path-level policy validation from blob content inspection to balance performance with uncompromising security:

- **Path Policy Checks CANNOT Be Deduplicated:**  
  Every occurrence of a `(path, status)` record encountered across ordinary commits and per-parent merge comparisons **must be evaluated independently**, regardless of whether the associated blob SHA has been seen before:
  1. **Restricted Path Check:** Validates `path` against all 9 restricted dataset patterns (`dataset/raw/jobs/**`, `dataset/raw/resumes/**`, `dataset/quarantine/**`, `dataset/donor_agreements/**`, `dataset/temp/**`, `dataset/.cache/**`, `dataset/takedown_log.json`). Any match triggers an immediate fail-closed block (exit code 1).
  2. **Universal Binary Document Extension Ban:** Asserts `path` does not end in prohibited binary extensions (`.pdf`, `.docx`, `.doc`, `.rtf`, `.bin`, `.zip`, `.tar`, `.gz`, etc.).
  3. **Resume Release Tier Restrictions:** For any path in `dataset/normalized/resumes/**`, verifies destination blob carries `release_eligibility: "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`.
  4. **Pinned Legacy Fixture Protection:** Asserts `path` does not modify or delete pinned legacy fixtures.
  - *Critical Security Invariant:* If a completely clean, PII-free JSON blob is committed under `dataset/raw/resumes/clean_sample.json`, caching the blob's clean inspection status must **never** bypass the path restriction. The path check evaluates independently and **fails closed with exit code 1**.

- **Blob Content Inspection (Expensive Deep Scanning) CAN Be Safely Deduplicated by `dst-sha`:**  
  Git blob objects are cryptographically content-addressed: identical content produces an identical SHA digest.
  - The scanner maintains an in-memory cache of inspected blob digests:
    $$\text{inspected\_blobs}: \text{Dict}[\text{blob\_sha}, \text{BlobValidationResult}]$$
  - When a valid destination blob SHA (`dst-sha != '0000000...'`) is encountered:
    - **Cache Hit (Previously Invalid):** If `dst-sha` was previously inspected and marked INVALID (contained PII, binary magic bytes, or invalid release tier), the scanner immediately fails closed with exit code 1.
    - **Cache Hit (Previously Valid):** If `dst-sha` was previously inspected and marked VALID, the scanner skips redundant retrieval and regex/NER scanning.
    - **Cache Miss (New Blob):** The scanner retrieves and inspects the blob:
      1. Existence check: `git cat-file -e <dst-sha>` (fails closed with exit 1 if missing).
      2. Object type assertion: `git cat-file -t <dst-sha>` returns `blob` (fails closed with exit 1 if non-blob).
      3. Content retrieval: `git cat-file -p <dst-sha>`.
      4. Binary payload inspection: Checks magic bytes / MIME types for ELF, PDF, ZIP, MS-Office binary headers.
      5. Deep PII scanning: Scans text for RFC 5322 emails, E.164 telephone numbers, physical street addresses, and candidate vanity URLs (whitelisting technical URLs).
      6. Release eligibility validation: For normalized resumes, asserts `release_eligibility == "RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE"`.
      7. Cache the validation result in `inspected_blobs[dst-sha]`.
  - This safe deduplication prevents exponential or redundant blob scanning across multi-parent merges without creating any path-policy bypass window.

##### 7. Algorithmic Verification Across Critical Revision Scenarios
The proposed per-parent traversal, binary-safe NUL parsing, and decoupled inspection engine is verified against all 10 critical revision scenarios:

1. **Add-then-Delete:**  
   - *Scenario:* File added in commit $C_1$ (blob $B_1$), deleted in commit $C_2$ before PR tip.  
   - *Algorithmic Result:* Phase 1 audits $C_1$, discovers $B_1$ via `diff-tree`, retrieves $B_1$ via `git cat-file`, detects restricted path/PII/binary payload, and **fails closed with exit code 1**. Deletion in $C_2$ does not clear the historical violation.
2. **Modify-then-Delete:**  
   - *Scenario:* Permitted file modified in $C_1$ with candidate PII (blob $B_1$), then deleted or reverted in $C_2$.  
   - *Algorithmic Result:* Phase 1 audits $C_1$, captures $B_1$ via status `M`, decodes text, detects RFC 5322 email regex match, and **fails closed with exit code 1**.
3. **Rename:**  
   - *Scenario:* Restricted file renamed to permitted path, or legacy fixture renamed.  
   - *Algorithmic Result:* Decomposed into `D` (source) and `A` (target). Legacy deletion check blocks fixture tampering; target path and `<dst-sha>` content checks block restricted data/PII. **Fails closed with exit code 1** on any violation.
4. **Copy:**  
   - *Scenario:* File copied into a new path.  
   - *Algorithmic Result:* Modeled as Addition `A` at destination. Path restrictions and destination blob content are validated via `git cat-file`. **Fails closed with exit code 1** if copied file violates rules.
5. **Merge (Parent-Matching Resolution & Evil Merge):**  
   - *Scenario:* Merge commit $M$ resolves conflict by adopting parent $P_2$'s version of a file containing a restricted blob or PII (where $P_1$ differed), or introduces new PII during conflict resolution.  
   - *Algorithmic Result:* Per-parent comparison $P_1 \rightarrow M$ detects the departure between $T(M)$ and $T(P_1)$, extracts `dst-sha` ($T(M)$), checks path policy, runs blob PII inspection, and **fails closed with exit code 1**. (Combined diff `-c` would have silently dropped parent-matching resolutions; per-parent `diff-tree -m` guarantees capture).
6. **Type Change (`status: T`):**  
   - *Scenario:* A file mode changes (e.g. standard file replaced by symlink `120000` or submodule `160000`).  
   - *Algorithmic Result:* Omitting restrictive diff-filters ensures Git emits `status: T`. Parser examines `<dst-mode>`; detects prohibited mode `120000` or `160000` in `dataset/` and **fails closed with exit code 1**.
7. **Symlink / Gitlink Submodule Injection:**  
   - *Scenario:* Contributor attempts to commit a symbolic link (`120000`) or submodule pointer (`160000`, object `commit`) within `dataset/`.  
   - *Algorithmic Result:* Mode check detects prohibited mode in `dataset/`; object-type validation isolates commit objects from blob scanning; scanner **fails closed with exit code 1**.
8. **Non-Blob Object Reference:**  
   - *Scenario:* Tree diff record points to a `tree` or `commit` object where a blob was expected.  
   - *Algorithmic Result:* `git cat-file -t <dst-sha>` reports non-blob object type; scanner terminates immediately with **exit code 1** without passing non-blob object to content scanner.
9. **Shallow Clone:**  
   - *Scenario:* CI runner clones repository with `--depth=1`.  
   - *Algorithmic Result:* Pre-flight check `git rev-parse --is-shallow-repository` detects shallow history and **fails closed immediately with exit code 1**, halting execution until `fetch-depth: 0` is configured.
10. **Target-Ref Resolution & Scan Failure:**  
    - *Scenario:* Target ref `origin/${GITHUB_BASE_REF:-main}` is missing or ambiguous, filenames contain spaces/newlines, or scanner encounters timeout (> 5000 ms) or decode crash.  
    - *Algorithmic Result:* Target-ref pre-flight catches unresolvable refs; NUL stream parsing preserves exact whitespace-containing paths; fail-closed handler catches any error/uncertainty and **terminates with exit code 1**.

##### 8. Explicit Scope Limitations & Historical Repository Boundary
To maintain absolute scientific and operational honesty, the plan formally documents the boundary of PR-range scanning:
- **PR Range Scope Boundary:** PR-range scanning inspects **strictly the commits and blobs introduced within the active pull request** (`MERGE_BASE..HEAD`).
- **No Claim of Historical Repository Cleanliness:** PR-range scanning does **not** inspect or establish that the entire repository history (from repository inception to `origin/main`) is clean. FairHire AI makes **no claim that the historical repository is clean**, because no comprehensive repository history audit has been executed and no audit evidence has been recorded.
- **Out-of-Scope Archival Task:** Deep historical scanning across all legacy commits (e.g., via `git-filter-repo`, BFG Repo-Cleaner, Gitleaks, or Trufflehog across the entire repository history) remains an **explicitly out-of-scope archival/audit task** for Phase 5A dataset ingestion planning.
- **Future Audit Prerequisite:** If an institutional security audit of historical commits is required, it must be commissioned as a separate operational task with documented evidence. In the event of any data leakage incident, Section 5.4 mandates deep repository history scrubbing using `git filter-repo`.

---

## 12. Dataset Versioning, Master Manifest & Reproducibility Requirements

### 12.1 Canonical Machine-Readable Manifest (`manifest.json`)
The dataset designates **`manifest.json` as the single canonical machine-readable manifest**. All other formats (e.g., `manifest.csv`) are strictly generated, read-only secondary exports produced from `manifest.json`.

```json
{
  "_notice": "ILLUSTRATIVE EXAMPLE ONLY — NOT ACTUAL DATA OR COMPLETED QA EVIDENCE",
  "dataset_version": "v0.1.0-pilot",
  "generated_at": "2026-10-15T00:00:00Z",
  "canonical_manifest": true,
  "total_records": {
    "sources": 6,
    "job_descriptions": 30,
    "resumes": 60,
    "evaluation_pairs": 60,
    "annotations_primary": 190,
    "annotations_adjudicated": 25
  },
  "git_commit_hash": "a1b2c3d4e5f6...",
  "records": [
    {
      "record_id": "JD-001",
      "entity_type": "JOB_DESCRIPTION",
      "file_path": "dataset/normalized/jobs/JD-001.json",
      "sha256": "mock_hash_illustrative_only_0000000000000000000000000000000000000001",
      "source_id": "SRC-001"
    },
    {
      "record_id": "RES-001",
      "entity_type": "RESUME",
      "file_path": "dataset/normalized/resumes/RES-001.json",
      "sha256": "mock_hash_illustrative_only_0000000000000000000000000000000000000002",
      "source_id": "SRC-002"
    }
  ]
}
```

> [!NOTE]
> All hash strings, timestamps, record counts, and commit hashes displayed above are **purely illustrative placeholders**. No real records or cryptographic manifests have been generated yet. The primary annotation count reflects 80 double-blind pilot annotations ($10 \text{ JDs} \times 2 + 10 \text{ Resumes} \times 2 + 20 \text{ Pairs} \times 2$) plus 110 single-pass annotations ($20 \text{ JDs} + 50 \text{ Resumes} + 40 \text{ Pairs}$) for a reconciled total of 190 primary records.

### 12.2 Semantic Dataset Versioning
Dataset releases adhere to Semantic Versioning (`MAJOR.MINOR.PATCH`):
- **Patch (`0.1.1`):** Typographical correction in annotations; zero changes to records or splits.
- **Minor (`0.2.0`):** Additional approved records or evaluation pairs added; existing records unchanged.
- **Major (`1.0.0`):** Restructuring of schemas, modification of ground-truth labels, or re-generation of splits.
The Phase 5A pilot dataset is assigned version **`v0.1.0-pilot`**.

---

## 13. Phase 5A Acceptance Criteria & Quality Gate

Phase 5A implementation will be evaluated against a structured Quality Gate that explicitly separates **Mandatory Non-Negotiable Gates** (zero tolerance) from **Research-Quality Diagnostic Metrics & Pilot Targets**.

### 13.1 Part A: Mandatory Non-Negotiable Gates (Zero-Tolerance Enforcement)
Failure in any of these gates constitutes an automatic blocker. No exceptions or waivers permitted.

| Gate ID | Dimension | Acceptance Criteria | Corresponding Verification Tests | Unambiguous Pass/Fail Condition | Status |
|---|---|---|---|---|:---:|
| **GATE-MANDATORY-01** | **Rights & Provenance** | $100\%$ of records link to an approved `source_manifest` with documented legal/terms basis, reviewer identity, and approval date. Zero unvetted, unapproved, or ambiguous sources. All approved sources satisfy permission compatibility rules. Ephemeral and quarantined sources isolated from persistent storage. Internal-only approval never permits public release. | Sub-Suite 1 (`TC-SCHEMA-01` .. `TC-SCHEMA-14`, including `TC-SCHEMA-02B`, `TC-SCHEMA-02C`, `TC-SCHEMA-08B`..`08F`) and Sub-Suite 2 (`TC-REL-01` .. `TC-REL-06`, `TC-REL-03B`). | **Pass:** `validate_dataset.py` exits with code 0; zero foreign key errors (`S-VAL-01`); zero rights incompatibility violations (`S-VAL-02` through `S-VAL-08`). Any single violation yields exit code 1 $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-02** | **PII Elimination & Release Eligibility** | Zero phone numbers, emails, candidate vanity URLs, or candidate street addresses in normalized resume records. `direct_identifiers_removed` verified true. Public derivatives satisfy `RELEASE_ELIGIBLE_PUBLIC_DERIVATIVE`. Zero raw resume hashes in public records. Whitelisted technical URLs preserved. Fail-closed on any scanner crash, timeout, format error, or uncertain finding. | Sub-Suite 1 (`TC-SCHEMA-17` .. `TC-SCHEMA-22`) and Sub-Suite 4 (`TC-PII-01` .. `TC-PII-10`). | **Pass:** `test_pii_scanner.py` exits with code 0; exactly zero PII tokens detected across all normalized files; zero raw hashes leaked in public records (`TC-REL-09`); all failure/uncertainty conditions fail closed with exit code 1. Any PII finding $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-03** | **Schema Compliance** | $100\%$ of JSON records pass JSON Schema (Draft 2020-12) validation across all 6 schemas with zero errors. All conditional validations pass. Zero ungrounded annotations. | Sub-Suite 1 (`TC-SCHEMA-01` .. `TC-SCHEMA-26`) across all schema files in `dataset/schemas/`. | **Pass:** `test_schema_contracts.py` reports $100\%$ validation pass rate with zero `jsonschema.ValidationError` exceptions across all dataset files. Any single schema validation error $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-04** | **Offset Integrity** | $100\%$ of character offsets satisfy: `normalized_text[char_start:char_end] == verbatim_text` using canonical Python 0-based Unicode code-point indexing. Zero offset drift. Astral symbols, combining marks, and technical symbols verified. | Sub-Suite 2 (`TC-REL-10`, `TC-REL-14`). | **Pass:** Programmatic string slice assertion `target.normalized_text[char_start:char_end] == verbatim_text` evaluates boolean `True` for 100% of primary and adjudicated spans; zero character shifts permitted. Any offset mismatch $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-05** | **Git Safety Enforced** | Pre-commit hook and CI script active; all 9 restricted paths gitignored with recursive coverage (`**`); universal binary ban enforced; PR revision-range blob content scanner audits all newly introduced and modified blobs in `MERGE_BASE..HEAD` via `git cat-file`, performing explicit target-ref pre-flight resolution and merge-base verification, per-parent merge commit comparisons (`git diff-tree -m --raw -z`) without restrictive `--diff-filter` dropping type changes (`status: T`), binary-safe NUL-delimited stream parsing (preserving whitespace and newlines in filenames without shell word-splitting), strict object-type validation (`git cat-file -t`) enforcing universal prohibition of symlinks (`120000`) and gitlinks/submodules (`160000`) in `dataset/` and isolating non-blob objects from blob scanning, independent path policy validation decoupled from safe blob inspection deduplication, and detecting historical blobs from intermediate commits (including added-then-deleted files), unreleased derivatives, and PII; fail-closed execution on missing target refs, unretrievable/missing objects, non-blob objects, malformed diff records, unexpected file modes, shallow clones, timeouts, scanner crashes, or uncertain findings. | Sub-Suite 3 (`TC-GIT-01A/B` .. `TC-GIT-21`) and Sub-Suite 4 (`TC-PII-06` .. `TC-PII-09`). | **Pass:** `verify_git_safety.py --staged` and `--ci` return exit code 0; `git status --porcelain` reveals zero tracked files in any restricted path; PR revision-range blob scanner returns exit code 0 across all non-merge and per-parent merge diffs; simulated violations (`TC-GIT-01A` through `TC-GIT-21`) yield immediate non-zero exit code 1. Any staged restricted file, prohibited object mode, or prohibited blob $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-06** | **Matcher Blinding & Invariance** | Annotators blinded to matcher scores; zero gold labels derived from production matcher; backend code, migrations V1–V5, and scoring engine frozen. Pre-experimental hypotheses formed strictly from document taxonomy without matcher scoring. | Sub-Suite 1 (`TC-SCHEMA-25`), Sub-Suite 5 (`TC-HYP-01`), and Git repository diff check. | **Pass:** All annotation records contain `matcher_score_blinded: true`; zero matching engine invocations in dataset creation scripts; `git diff main -- backend/` and `git diff main -- fairhire_ai/` return exactly empty diff across production matcher, Java logic, and database migrations V1–V5. Any matcher contamination $\implies$ **FAIL**. | PENDING |
| **GATE-MANDATORY-07** | **Legacy Fixture Preservation** | Existing fixtures in `dataset/raw/sample_jds.json` and `dataset/raw/sample_resumes/` remain completely intact, unmodified, and un-renamed. | Sub-Suite 3 (`TC-GIT-10`, `TC-GIT-11`). | **Pass:** Cryptographic SHA-256 digests of `sample_jds.json` and `sample_resumes/resume_1.txt..resume_4.txt` match pinned values identically with 0 diff. Any byte modification or deletion yields exit code 1 $\implies$ **FAIL**. | PENDING |

### 13.2 Part B: Research-Quality Diagnostic Metrics & Pilot Targets
Evaluates pilot execution targets. Documented exceptions are permitted only where specified below.

| Gate ID | Dimension | Pilot Target | Handling & Permitted Exceptions | Status |
|---|---|---|---|---|
| **GATE-DIAGNOSTIC-01** | **Record Targets** | 30 JDs (25 tech + 5 cross-functional), 60 resumes, 60 exploratory pairs. | **Documented Exception Permitted:** If authorized donated resumes fall short of 15, shortfall is directly replaced with approved synthetic profiles up to 60. Privacy/provenance gates cannot be relaxed. | PENDING |
| **GATE-DIAGNOSTIC-02** | **Double-Annotation Pilot** | At least 10 JDs, 10 resumes, and 20 evaluation pairs independently double-annotated; adjudications recorded in `ADJ-XXX` records. | Mandatory pilot diagnostic (minimum 80 double-blind primary records across 10 JDs, 10 Resumes, and 20 Pairs). Disagreements across all 3 entity types must be fully documented in confusion matrices and adjudicated. | PENDING |
| **GATE-DIAGNOSTIC-03** | **Agreement Diagnostics** | Diagnostic targets: Cohen's $\kappa \ge 0.70$, Span F1 $\ge 0.80$, Pair Likert agreement $\ge 75\%$. | **Review Trigger:** If agreement falls below target, pause annotation, conduct error analysis, revise guidelines, and re-annotate pilot. Never fabricate or suppress metrics. | PENDING |
| **GATE-DIAGNOSTIC-04** | **Deduplication Audit** | Zero exact duplicates; MinHash near-duplicate screening ($\ge 0.85$). | Near-duplicates flagged and grouped; logged in quality report. | PENDING |
| **GATE-DIAGNOSTIC-05** | **Quality Report Generated** | Complete `dataset/reports/quality_report_v0.1.0.md` detailing distributions, agreement metrics, and pilot limitations. | Markdown and JSON summary inspection. | PENDING |

---

## 14. Risks, Assumptions, Recorded Decisions & Proposed Implementation Sequence

### 14.1 Risk Analysis & Mitigation Matrix
| Risk ID | Identified Risk | Severity | Mitigation Strategy |
|---|---|---|---|
| **R-01** | **Legal/Copyright Exposure:** Public web sources allege ToS violation or revoke permission. | HIGH | Rely primarily on synthetic archetypes; treat fair use as a case-by-case rationale requiring review, not an automatic grant; quarantine ambiguous sources. |
| **R-02** | **PII Leakage & Linkability:** Candidate contact data committed to Git or linked via raw document hashes. | CRITICAL | Omit raw resume hashes from public records; enforce release eligibility tiers; enforce Gitignore + pre-commit hook + CI safety script + automated regex PII scanner. |
| **R-03** | **Annotator Subjectivity & Low IAA:** Ambiguous guidelines lead to poor agreement on exclusionary terms. | MEDIUM | Double-annotation diagnostic pilot; report confusion matrices; treat thresholds as review triggers for guideline revision. |
| **R-04** | **Premature Split Contamination:** Future train/test evaluations contaminated by shared entity IDs or near-duplicates. | HIGH | Treat initial 5A pairs as an exploratory inventory; require cluster/group-based partitioning for future benchmark splits. |
| **R-05** | **Scope Creep into Phase 5B:** Premature introduction of LLM fine-tuning, embeddings, or scoring changes. | HIGH | Strict phase gate boundary enforcement; freeze all application code, database migrations, and matching algorithms. |

### 14.2 Key Assumptions
1. **Case-by-Case Research Review:** Collection of public career page postings is evaluated under documented academic research rationales, not unverified blanket exemptions.
2. **Deterministic Stability:** The Phase 4 deterministic scoring engine and Phase 3B skill extraction engine remain invariant benchmarks throughout all Phase 5 experiments.
3. **Synthetic Representativeness Boundaries:** Synthetic resumes support structural, algorithmic, and syntactic testing, but do not establish real-world ecological validity or generalizable labor market distributions.

### 14.3 Recorded Human Decisions (Approved for Planning)

Following human review, the architectural choices, data policies, evaluation metrics, and platform prerequisites have been formally recorded as **approved for planning**:

1. **Dataset Architecture (Option B Approved for Planning):**
   - **Decision:** Formally approved Option B (Consolidated Architecture), establishing the existing repository root `dataset/` directory as the authoritative research dataset location while strictly preserving existing baseline sample fixtures in `dataset/raw/sample_jds.json` and `dataset/raw/sample_resumes/` intact with pinned SHA-256 digests.
   - **Planning Status:** **APPROVED FOR PLANNING.**
   - **Rationale:** Eliminates competing directory hierarchies, ensures consistency with existing documentation, and avoids duplicate `.gitignore` specifications.

2. **Donation Policy & Synthetic Fallback (Approved for Planning):**
   - **Decision:** Formally approved the 14-day volunteer resume donation intake window and the automated fallback policy: if fewer than 15 authorized volunteer donations with executed consent agreements are obtained, the deficit is automatically backfilled with approved synthetic candidate profiles up to the 60-resume pilot target.
   - **Planning Status:** **APPROVED FOR PLANNING.**
   - **Rationale:** Enforces zero compromise on informed consent while guaranteeing that pilot sampling quotas (60 resumes) are met without delaying research execution.

3. **Evaluation Scale (Anchored 1–5 Likert Scale Approved for Planning):**
   - **Decision:** Formally approved the anchored 1–5 Likert suitability scale (1=Completely Unqualified, 2=Minimally Qualified, 3=Moderately Qualified, 4=Highly Qualified, 5=Exceptionally Qualified) as the primary human evaluation pair ground-truth metric, with defined operational rubrics for pre-experimental hypothesis validation.
   - **Planning Status:** **APPROVED FOR PLANNING.**
   - **Rationale:** Provides granular qualification discrimination suitable for inter-rater reliability analysis and quadratic weighted kappa ($\kappa_w$) computation without premature threshold binarization.

4. **CI Prerequisite & Enforcement Boundary (Acknowledged for Planning):**
   - **Decision & Acknowledgment:** The remote CI pipeline is acknowledged as currently unconfigured (zero active guarantee today). Remote CI cannot and will not be treated as an enforceable security control until the required platform branch protection rules, required status checks, and bypass restrictions are fully provisioned and verified on GitHub/GitLab.
   - **Planning Status:** **ACKNOWLEDGED & RECORDED FOR PLANNING.**
   - **Rationale:** Establishes clear distinction between design specifications and active platform enforcement boundaries.

> [!CAUTION]
> **Explicit Governance Boundary — Planning Approval vs. Implementation Authorization:**  
> The above decisions are **approved strictly within the scope of this planning document**. **Planning approval does NOT constitute authorization to implement Phase 5A.**  
> In compliance with repository phase-gate governance:
> - **Phase 5A implementation and data collection remain strictly UNAUTHORIZED and ON HOLD.**
> - Zero data collection, downloading, or harvesting may occur.
> - Zero dataset files, resume records, schemas, scripts, hooks, or CI workflows may be created.
> - Production backend code, matching algorithms, frontend code, and database migrations V1–V5 remain frozen.
> - Phase 5A Step 1 execution shall commence ONLY upon separate, explicit, written authorization.

### 14.4 Proposed Implementation Sequence (Upon Approval)
Once this plan is formally reviewed, approved, and authorized, Phase 5A execution shall proceed in six sequential, verifiable steps:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PROPOSED PHASE 5A EXECUTION PHASES                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 1: Governance & Documentation Foundation                               │
│ • Publish detailed guidelines in docs/research/ (data-dictionary, etc.)      │
│ • Update .gitignore and install .git/hooks/pre-commit safety scanner        │
│ • Inventory existing sample fixtures to verify zero breaking dependencies   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 2: JSON Schema Specification Authoring                                 │
│ • Create draft JSON schemas in dataset/schemas/ (including adjudication)    │
│ • Validate schemas with schema-test matrix (including conditional logic)    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 3: Tooling Authoring (scripts/dataset/)                                │
│ • Implement validate_dataset.py, detect_duplicates.py, verify_git_safety.py │
│ • Verify zero production backend dependencies                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 4: Source Intake & Sanitization Pipeline                               │
│ • Populate source_manifest records with reviewer approvals & release tiers  │
│ • Generate/ingest 30 JDs and 60 Resumes through normalization & PII scrub   │
│ • Execute deduplication and foreign key validation                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 5: Double-Annotation Diagnostic Pilot & Adjudication                    │
│ • Execute independent double-annotation on 10 JDs, 10 Resumes, and 20 Pairs │
│ • Calculate Cohen's Kappa, Span F1, pair agreement & confusion matrices     │
│ • Record ADJ-XXX consensus records; complete remaining single-pass labels   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Step 6: Inventory Index, Manifest Generation & QA Gate Sign-Off             │
│ • Compile pilot_record_index.json and canonical manifest.json with SHA-256  │
│ • Generate quality_report_v0.1.0.md; evaluate against Quality Gate criteria │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Document Governance & Status Summary

- **Current Operational Status:** `PLANNING — HUMAN DECISIONS RECORDED (IMPLEMENTATION UNAUTHORIZED)`
- **Implementation Status:** `STRICTLY UNSTARTED & ON HOLD (ZERO FILES CREATED BEYOND THIS PLAN)`
- **Next Required Action:** Separate, explicit human authorization before commencing Phase 5A Step 1.

