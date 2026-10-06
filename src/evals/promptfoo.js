import promptfoo from "promptfoo";
import path from "path";
import { fileURLToPath } from "url";
import { getTestCasesByChangedFileName } from "#src/utils/filterMap.js";
import { getTestCasesBySuiteNames } from "#src/utils/evalSuiteMap.js";
import { promtfooCofig } from "./promptfooConfig.js";
import { composeProviders } from "#src/utils/common.js";
import { cleanup } from "#src/utils/cleanup.js";

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

export const evaluate = async (
  changedFilesOrOptions,
  commit_sha,
  repository,
  ref,
) => {
  let tests = [];
  let providers = [];
  let runDir;
  try {
    const isObjectOptions =
      typeof changedFilesOrOptions === "object" &&
      !Array.isArray(changedFilesOrOptions) &&
      changedFilesOrOptions !== null;

    if (isObjectOptions) {
      const options = changedFilesOrOptions;
      if (
        Array.isArray(options.changed_files) &&
        options.changed_files.length > 0
      ) {
        tests = getTestcases(options.changed_files);
      } else {
        tests = getTestCasesBySuiteNames(options.eval_suites);
      }

      const res = composeProviders(options);
      providers = res.providers;
      runDir = res.runDir;
    } else {
      // Positional arguments (legacy webhook)
      tests = getTestcases(changedFilesOrOptions);
      const res = composeProviders(commit_sha, repository, ref);
      providers = res.providers;
      runDir = res.runDir;
    }

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
  } catch (err) {
    console.error(err);
    return err;
  } finally {
    cleanup(runDir);
  }
};
