import express from "express";
import { runEvaluationAndComment } from "#src/utils/githubUtil.js";
import { getAvailableSuites } from "#src/utils/evalSuiteMap.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

/**
 * List all available eval suites
 */
app.get("/api/suites", (req, res) => {
  res.json({ suites: getAvailableSuites() });
});

/**
 * Trigger evaluation with custom versions and suite/file selection
 */
app.post("/api/evaluate", async (req, res) => {
  const {
    repository,
    old_version,
    new_version,
    eval_suites,
    changed_files,
    pr_number: directPrNumber,
    callback,
  } = req.body || {};

  if (!repository) {
    return res
      .status(400)
      .json({ error: "Missing required field: repository" });
  }

  if (!new_version || (!new_version.ref && !new_version.commit_sha)) {
    return res.status(400).json({
      error: "Missing required field: new_version with 'ref' or 'commit_sha'",
    });
  }

  const prNumber =
    directPrNumber ||
    (callback?.type === "pr_comment" ? callback.pr_number : undefined);

  res.status(202).json({
    status: "accepted",
    message:
      "Evaluation started. Results will be saved locally by promptfoo" +
      (prNumber ? " and posted to PR." : "."),
  });

  runEvaluationAndComment({
    repository,
    old_version,
    new_version,
    eval_suites,
    changed_files,
    pr_number: prNumber,
  }).catch((err) =>
    console.error("[api/evaluate] Evaluation process failed:", err.message),
  );
});

/**
 * Webhook triggered from GitHub Actions on PR
 */
app.post("/api/eval-webhook", async (req, res) => {
  const body = req.body;
  console.log("[eval-webhook] Received body:", JSON.stringify(body, null, 2));

  const { changed_files, commit_sha, repository, ref, pr_number } = body || {};

  if (!changed_files) {
    return res.status(204).end();
  }

  if (!commit_sha || !repository || !ref) {
    return res.status(400).json({
      error: "Missing required fields: commit_sha, repository, ref",
    });
  }

  res.status(202).json({
    status: "accepted",
    message: "Evaluation started, result will be posted to PR.",
  });

  runEvaluationAndComment({
    repository,
    old_version: { ref: "main" },
    new_version: { ref, commit_sha },
    changed_files,
    pr_number,
  }).catch((err) =>
    console.error("[api/eval-webhook] Evaluation process failed:", err.message),
  );
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
