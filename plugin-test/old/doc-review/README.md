# Document Review Plugin (`doc-review`)

Professional document review, auditing, and linter plugin for Claude Code. This plugin assists in reviewing completeness, clarity, structure, grammar, technical accuracy, and formatting for PRDs, Technical Architecture Specs, API References, User Guides, and README files.

---

## 🛠️ Key Features

1. **Comprehensive Document Review (`/review-doc`)**:
   - Calculates a Document Quality Index (Score 0-100).
   - Audits 5 core pillars: Structure, Clarity, Technical Completeness, Consistency, and Formatting/Grammar.
   - Generates suggested refactored drafts for underperforming sections.

2. **API Documentation Audit (`/audit-api-doc`)**:
   - Performs in-depth audits on API documentation (OpenAPI, Swagger, Markdown API specs).
   - Audits endpoints, HTTP methods, headers, authentication, request parameters, response schemas, error formats, and executable code samples.

3. **Markdown Format Linter (`/doc-lint`)**:
   - Scans heading hierarchy skips.
   - Detects broken relative links, missing image alt text, code blocks missing syntax language tags, and unaligned tables.

4. **Specialized Auditor Sub-Agent (`doc-auditor`)**:
   - Expert agent acting as a Senior Technical Writer to audit complex technical documentation, uncover ambiguities, and fill content gaps.

5. **Document Quality Guidelines (`doc-review-standards`)**:
   - Skill guiding Claude Code to enforce active voice, measurable SLAs, consistent terminology, and standard PRD/RFC/README structures.

---

## 🚀 Usage Guide

### 1. Review any document file
```bash
/review-doc README.md
```
or audit a PRD file:
```bash
/review-doc docs/PRD-payment-v2.md
```

### 2. Audit API documentation
```bash
/audit-api-doc docs/api-reference.md
```

### 3. Lint Markdown formatting
```bash
/doc-lint docs/user-guide.md
```

---

## 📁 Plugin Directory Structure

```text
plugins/doc-review/
├── .claude-plugin/
│   └── plugin.json             # Manifest of doc-review plugin
├── commands/                   # Custom slash commands
│   ├── review-doc.md
│   ├── audit-api-doc.md
│   └── doc-lint.md
├── agents/                     # Sub-Agent auditor specification
│   └── doc-auditor.md
├── skills/                     # Skill guidelines
│   └── doc-review-standards/
│       └── SKILL.md
├── evals/                      # Promptfoo Evaluation Suite (9 Test Cases)
│   ├── fixtures/               # Sample document fixtures
│   ├── prompts/                # Prompt templates (/review-doc, /audit-api-doc, /doc-lint)
│   ├── suites/                 # Modular test suite files
│   │   ├── review-doc-suite.yaml     # Suite 1: 3 test cases for /review-doc
│   │   ├── audit-api-doc-suite.yaml  # Suite 2: 3 test cases for /audit-api-doc
│   │   └── doc-lint-suite.yaml       # Suite 3: 3 test cases for /doc-lint
│   └── promptfooconfig.yaml    # Master evaluation config
└── README.md
```

---

## 🧪 Testing with Promptfoo (Evaluation Suite)

The plugin includes 9 automated test cases organized into **3 modular test suites** using **Promptfoo**:

### 1. Run individual test suites:
```bash
# Suite 1: Test /review-doc command (3 Test cases)
npx promptfoo eval -c plugins/doc-review/evals/suites/review-doc-suite.yaml

# Suite 2: Test /audit-api-doc command (3 Test cases)
npx promptfoo eval -c plugins/doc-review/evals/suites/audit-api-doc-suite.yaml

# Suite 3: Test /doc-lint command (3 Test cases)
npx promptfoo eval -c plugins/doc-review/evals/suites/doc-lint-suite.yaml
```

### 2. Run all 9 Test cases at once:
```bash
npx promptfoo eval -c plugins/doc-review/evals/promptfooconfig.yaml
```

### 3. View evaluation report UI:
```bash
npx promptfoo view
```
