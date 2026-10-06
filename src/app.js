import express from "express";
import { runEvaluationAndComment } from "#src/utils/githubUtil.js";
import { getAvailableSuites } from "#src/utils/evalSuiteMap.js";

import jobQueue from "#src/utils/jobQueue.js";
import { mrDebounceMap, DEBOUNCE_WAIT_MS } from "#src/utils/mrDebounce.js";

const app = express();

app.use(express.json());

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

  jobQueue.enqueue(() =>
    runEvaluationAndComment({
      repository,
      old_version,
      new_version,
      eval_suites,
      changed_files,
      pr_number: prNumber,
    }).catch((err) =>
      console.error("[api/evaluate] Evaluation process failed:", err.message),
    ),
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

  const key = `${repository}-${pr_number}`;
  if (mrDebounceMap.has(key)) {
    const existing = mrDebounceMap.get(key);
    clearTimeout(existing.timer);
    console.log(
      `[Debounce] Cancelled previous eval for ${repository} (${pr_number})`,
    );
  }

  res.status(202).json({
    status: "accepted",
    message: `Received commit ${commit_sha.slice(0, 7)} for PR #${pr_number}. Debouncing for ${DEBOUNCE_WAIT_MS / 1000}s...`,
  });

  const timer = setTimeout(async () => {
    mrDebounceMap.delete(key);
    // Calculate current queue position
    const queuePosition = jobQueue.size() + (jobQueue.pending() > 0 ? 1 : 0);
    // If need to wait in queue, send PR comment to update progress
    if (queuePosition > 0) {
      await postPRComment(
        repository,
        pr_number,
        `**Evaluation Queued:** The evaluation for commit \`${commit_sha.slice(0, 7)}\` is now at position **#${queuePosition + 1}** in the queue.`,
      ).catch(console.error);
    }
    // Add to global queue
    jobQueue.enqueue(async () => {
      console.log(
        `[Queue Runner] START running PR #${pr_number} (Commit: ${commit_sha.slice(0, 7)})`,
      );
      try {
        await runEvaluationAndComment({
          repository,
          old_version: { ref: "main" },
          new_version: { ref, commit_sha },
          changed_files,
          pr_number,
        });
      } catch (err) {
        console.error(`[Queue Runner] Error at PR #${pr_number}:`, err.message);
      }
    });
  }, DEBOUNCE_WAIT_MS);
  // Save debounce state of PR
  mrDebounceMap.set(key, { timer, commit_sha });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
