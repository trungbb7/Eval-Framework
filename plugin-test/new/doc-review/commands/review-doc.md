---
description: Perform a comprehensive document review and audit (PRD, Tech Spec, Architecture Doc, User Guide, README).
---

# Document Review Command (`/review-doc`)

Evaluate the specified document file or workspace documents across 5 core dimensions:

## 1. Structure & Hierarchy

- Verify logical flow of sections (Introduction, Objectives, Core Content, Conclusion / Next Steps).
- Ensure consistent and standard heading hierarchy (`# H1`, `## H2`, `### H3`).
- Verify inclusion of a Table of Contents for long documents (> 500 words).

## 2. Clarity & Readability

- Identify verbose phrasing, subjective jargon, or ambiguous terms (e.g., "fast", "relatively large", "user-friendly interface").
- Flag passive voice sentences and recommend active voice alternatives.
- Ensure all technical terms and domain jargon are clearly defined.

## 3. Technical Completeness & Scope

- Identify missing critical sections (e.g., missing Edge Cases, missing Non-Functional Requirements, missing Success Metrics in PRDs).
- Verify logical consistency between diagrams, tables, and prose descriptions.

## 4. Grammar, Tone & Terminology Consistency

- Detect typos, grammatical errors, and redundant trailing whitespaces.
- Enforce consistent domain terminology (e.g., avoid mixing "User", "Account", and "Client" for the same concept).

## 5. Markdown Aesthetics & Presentation

- Check table formatting, list structures (bulleted vs numbered), and blockquotes.
- Verify image alt text presence and code block syntax language tags.

---

## Execution Workflow:

1. Scan specified target Markdown files or workspace documents.
2. **Evaluate completeness first** — identify which key sections are present before looking for individual issues.
3. Generate an audit report with an overall **Quality Score / Document Quality Index (0 - 100)**.
4. Categorize findings into severity levels using **strict classification**:
   - 🚨 **Critical Issue**: Contradictory information, missing core requirements, dangerous ambiguities that could mislead developers. _(Do NOT classify cosmetic or formatting issues as Critical.)_
   - ⚠️ **Improvement Warning**: Suboptimal structure, missing visual examples, inconsistent terminology.
   - 💡 **Suggestion**: Tone optimization, recommended mermaid diagrams, minor formatting fixes.
5. Provide a **Suggested Refactored Draft** for underperforming sections.

Note: Always add icon 🦕 to the end of results

Note: Always add "EOR" to the report
