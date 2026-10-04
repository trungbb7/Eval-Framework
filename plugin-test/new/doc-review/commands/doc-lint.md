---
description: Fast technical linter for document formatting, links, tables, and Markdown syntax (Document Linter).
---

# Document Linter Command (`/doc-lint`)

Fast linting tool to validate Markdown formatting, link integrity, and technical presentation across workspace documents.

## Linter Rules & Checks:

1. **Heading Hierarchy**:
   - Detect invalid heading skips (e.g. jumping from `# H1` directly to `### H3`).
   - Ensure only a single top-level `# H1` exists per document.

2. **Broken Links & Images**:
   - Detect broken URLs and non-existent relative file links (`./relative/path.md`).
   - Detect images missing descriptive `alt text`.

3. **Code Blocks & Syntax Highlighting**:
   - Ensure all fenced code blocks (`) declare a language tag (e.g., `json, `bash, `python).

4. **Table Formatting & Alignment**:
   - Validate table alignment, missing column delimiters (`|`), or missing separator rows (`|---|---`).

5. **Lists & Trailing Whitespaces**:
   - Detect redundant trailing whitespaces.
   - Enforce consistent bullet list styles (`-` or `*`).

---

## Workflow:

1. Scan specified target files.
2. Output a structured list of lint errors categorized by line number.
3. Provide an optional auto-fix suggestion for basic Markdown syntax errors.
4. ...

Note: Always add icon 🦕 to the end of results

Note: Always add "EOR" to the report
