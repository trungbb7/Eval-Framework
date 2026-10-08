import promptfoo from "promptfoo";
import path from "path";

import { getTestCasesByChangedFileName } from "#src/configs/filterMap.js";
import { getTestCasesBySuiteNames } from "#src/configs/evalSuiteMap.js";
import { promtfooCofig } from "#src/integrations/promptfoo/config.js";
import { composeProviders } from "#src/utils/common.js";
import { cleanup } from "#src/utils/cleanup.js";
import { __dirname } from "#src/base.js";

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

export const evaluate = async (options) => {
  let tests = [];
  let providers = [];
  let runDir;
  try {
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

    const testSuite = {
      ...promtfooCofig,
      tests,
      providers,
      writeLatestResults: true,
    };

    const summary = await promptfoo.evaluate(testSuite, {
      showProgressBar: true,
      persist: true,
      cache: false,
    });
    return summary;
  } catch (err) {
    console.error(err);
    return err;
  } finally {
    cleanup(runDir);
  }
};
