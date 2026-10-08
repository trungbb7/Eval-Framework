import mrDebounceService, {
  DEBOUNCE_WAIT_MS,
} from "#src/services/mrDebounce.service.js";

import jobQueueService from "#src/services/jobQueue.service.js";
import githubService from "#src/services/github.service.js";

export const webhookController = async (req, res, next) => {
  try {
    const body = req.body;

    const { changed_files, commit_sha, repository, ref, pr_number } =
      body || {};

    if (!changed_files) {
      return res.status(204).end();
    }

    if (!commit_sha || !repository || !ref) {
      return res.status(400).json({
        error: "Missing required fields: commit_sha, repository, ref",
      });
    }

    const key = `${repository}-${pr_number}`;
    if (mrDebounceService.hasKey(key)) {
      const existing = mrDebounceService.get(key);
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
      mrDebounceService.delete(key);
      // Calculate current queue position
      const queuePosition =
        jobQueueService.size() + (jobQueueService.pending() > 0 ? 1 : 0);
      // If need to wait in queue, send PR comment to update progress
      if (queuePosition > 0) {
        await postPRComment(
          repository,
          pr_number,
          `**Evaluation Queued:** The evaluation for commit \`${commit_sha.slice(0, 7)}\` is now at position **#${queuePosition + 1}** in the queue.`,
        );
      }
      // Add to global queue
      jobQueueService.enqueue(async () => {
        console.log(
          `[Queue Runner] START running PR #${pr_number} (Commit: ${commit_sha.slice(0, 7)})`,
        );
        try {
          await githubService.runEvaluationAndComment({
            repository,
            old_version: { ref: "main" },
            new_version: { ref, commit_sha },
            changed_files,
            pr_number,
          });
        } catch (err) {
          console.error(
            `[Queue Runner] Error at PR #${pr_number}:`,
            err.message,
          );
        }
      });
    }, DEBOUNCE_WAIT_MS);
    // Save debounce state of PR
    mrDebounceService.add(key, { timer, commit_sha });
  } catch (error) {
    next(error);
  }
};

export const evaluationController = async (req, res, next) => {
  try {
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

    jobQueueService.enqueue(() =>
      githubService.runEvaluationAndComment({
        repository,
        old_version,
        new_version,
        eval_suites,
        changed_files,
        pr_number: prNumber,
      }),
    );
  } catch (error) {
    next(error);
  }
};
