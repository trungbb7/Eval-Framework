---
name: doc-review-standards
description: Core standards and guidelines for reviewing technical documentation, PRDs, RFCs, API Specs, and user guides.
---

# Document Review Standards & Guidelines

Use this skill whenever drafting, editing, or auditing technical documentation, product requirements, or API specifications.

## 1. Writing Principles & Tone

- **Prefer Active Voice**:
  - ❌ *Avoid*: "The configuration file will be loaded by the application upon startup."
  - ✅ *Prefer*: "The application loads the configuration file upon startup."
- **Conciseness & Precision**:
  - Eliminate redundant filler phrases (e.g., "as mentioned above", "it is worth noting that", "basically").
- **Quantifiable Technical SLA Criteria**:
  - ❌ *Avoid*: "The system responds extremely fast."
  - ✅ *Prefer*: "API response time (p99) is < 100ms under a load of 1,000 RPS."
- **Terminology Consistency**:
  - Maintain a single, consistent domain term for any given entity across the entire document.

## 2. Standard Document Structure Guidelines

### A. Product Requirement Document (PRD)
1. **Overview & Objectives**: Problem context and core rationale.
2. **User Personas & User Stories**: Target audience and usage scenarios.
3. **Functional Requirements**: Prioritized feature descriptions (P0, P1, P2).
4. **Non-Functional Requirements**: Performance, security, scalability, UI/UX SLAs.
5. **Out of Scope**: Explicitly list items **NOT** covered in the current release.
6. **Success Metrics**: Key Performance Indicators (KPIs, conversion rate, crash rate).

### B. Technical Architecture Spec / RFC
1. **Context & Problem Statement**: Technical problem and motivation.
2. **Proposed Solution & Architecture**: Proposed design with Mermaid diagrams.
3. **Data Model & API Contracts**: Data schemas, database tables, and endpoint specs.
4. **Alternative Solutions Considered**: Other evaluated approaches and reasons for rejection.
5. **Security, Scalability & Reliability**: Security controls, high availability, and disaster recovery.

### C. User Guides & README Files
1. **Quickstart / 5-minute setup**: Minimal steps to install and run locally.
2. **Prerequisites**: Environment requirements (Node.js version, OS, Python version).
3. **Usage Examples**: Copy-pasteable runnable code snippets.
4. **Troubleshooting & FAQ**: Common errors and quick fixes.

### D. README Scoring Guidance
- A README that covers **7 or more** of: ToC, Features, Installation, Quick Start, Configuration, API Reference, Benchmarks, Error Handling, Troubleshooting, Contributing — should score **>= 80/100**.
- **Do NOT penalize** concrete performance data (e.g., "100,000 RPS", "P99 < 5ms") as "unsubstantiated claims" when they are accompanied by benchmark methodology details (tools, hardware, parameters).
- **Cosmetic issues** (minor formatting, trailing whitespace, missing alt text) should be classified as **Suggestions**, not Critical issues.

## 3. Markdown Formatting Standards

- **Headings**: Single top-level `# H1` per file. Proper hierarchy down to `## H2` and `### H3`.
- **Code Blocks**: Always include syntax language tags (e.g., ```json, ```yaml, ```bash, ```typescript).
- **Images**: Always include descriptive `alt text`: `![Payment checkout flow diagram](./assets/checkout-flow.png)`.
- **Tables**: Clear column headers with proper alignment syntax.

