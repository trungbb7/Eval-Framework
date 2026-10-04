const fileUrlMap = new Map([
  [
    "plugins/cpp-code-review/agents/cpp-auditor.md",
    "code-review/cpp-review/testcases/cpp-review-testcases.yaml",
  ],
  [
    "plugins/cpp-code-review/commands/review-cpp.md",
    "code-review/cpp-review/testcases/cpp-review-testcases.yaml",
  ],
  [
    "plugins/cpp-code-review/skills/cpp-best-practices/SKILL.md",
    "code-review/cpp-review/testcases/cpp-review-testcases.yaml",
  ],
  // [
  //   "plugins/doc-review/agents/doc-auditor.md",
  //   "doc-review/audit-api-doc/testcases/audit-api-doc-testcases.yaml",
  // ],
  [
    "plugins/doc-review/commands/audit-api-doc.md",
    "doc-review/audit-api-doc/testcases/audit-api-doc-testcases.yaml",
  ],
  [
    "plugins/doc-review/commands/doc-lint.md",
    "doc-review/doc-lint/testcases/doc-lint-testcases.yaml",
  ],
  [
    "plugins/doc-review/commands/review-doc.md",
    "doc-review/review-doc/testcases/review-doc-testcases.yaml",
  ],
]);

export const getTestCasesByChangedFileName = (fileName) => {
  return fileUrlMap.get(fileName);
};
