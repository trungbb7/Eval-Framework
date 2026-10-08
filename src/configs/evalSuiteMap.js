import path from "path";
import { fileURLToPath } from "url";
import { __dirname } from "#src/base.js";

/**
 * Maps eval suite names to their testcase file paths (relative to evals dir).
 */
const evalSuiteMap = new Map([
  ["cpp-review", "code-review/cpp-review/testcases/cpp-review-testcases.yaml"],
  [
    "audit-api-doc",
    "doc-review/audit-api-doc/testcases/audit-api-doc-testcases.yaml",
  ],
  ["doc-lint", "doc-review/doc-lint/testcases/doc-lint-testcases.yaml"],
  ["review-doc", "doc-review/review-doc/testcases/review-doc-testcases.yaml"],
]);

/**
 * Returns an array of relative testcase file paths for the given suite names.
 * If suiteNames is empty or not provided, returns all available testcases.
 * @param {string[]} [suiteNames] - Array of suite names to resolve
 * @returns {string[]} Relative testcase file paths
 */
export const getTestCasesBySuiteNames = (suiteNames) => {
  const evalsDir = path.resolve(__dirname, "evals");

  const suites =
    suiteNames && suiteNames.length > 0 ? suiteNames : [...evalSuiteMap.keys()];

  const tests = [];
  for (const suite of suites) {
    const testPath = evalSuiteMap.get(suite);
    if (testPath) {
      const fullPath = path.resolve(evalsDir, testPath);
      const relativePath = path
        .relative(process.cwd(), fullPath)
        .replace(/\\/g, "/");
      tests.push(relativePath);
    }
  }
  return tests;
};

/**
 * Returns all available eval suite names and their testcase paths.
 * @returns {{ name: string, testcasePath: string }[]}
 */
export const getAvailableSuites = () => {
  return [...evalSuiteMap.entries()].map(([name, testcasePath]) => ({
    name,
    testcasePath,
  }));
};
