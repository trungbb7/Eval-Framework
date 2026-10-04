import promptfoo from "promptfoo";
import path from "path";
import { fileURLToPath } from "url";
import { getTestCasesByChangedFileName } from "#src/utils/filterMap.js";
import { promtfooCofig } from "./promptfooConfig.js";
import { composeProviders } from "#src/utils/common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getTestcases = (changed_files) => {
  const tests = [];
  if (!Array.isArray(changed_files)) return tests;
  for (const file of changed_files) {
    const test = getTestCasesByChangedFileName(file);
    if (test) {
      const testPath = path.resolve(__dirname, test);
      const relativePath = path
        .relative(process.cwd(), testPath)
        .replace(/\\/g, "/");
      tests.push(relativePath);
    }
  }
  return tests;
};

export const evaluate = async (changed_files, commit_sha, repository, ref) => {
  const tests = getTestcases(changed_files);
  const providers = composeProviders(commit_sha, repository, ref);
  const testSuite = {
    ...promtfooCofig,
    tests,
    providers,
    writeLatestResults: true,
  };

  console.log(`Test Suite: ${JSON.stringify(testSuite)}`);

  const summary = await promptfoo.evaluate(testSuite, {
    showProgressBar: true,
    persist: true,
  });
  return summary;
};
