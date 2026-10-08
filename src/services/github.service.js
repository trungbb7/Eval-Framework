import fetch from "node-fetch";
import { evaluate } from "#src/integrations/promptfoo/evaluator.js";
import { formatEvaluationReport } from "#src/utils/formatUtil.js";

const githubService = {
  async postPRComment(repository, prNumber, body) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn("[test-webhook] GITHUB_TOKEN not set, skipping PR comment.");
      return;
    }

    const [owner, repo] = repository.split("/");
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "eval-framework-bot",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ body }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API error ${res.status}: ${text}`);
    }

    console.log(
      `[test-webhook] PR comment posted successfully (HTTP ${res.status})`,
    );
    return res.json();
  },
  async postEvaluationComment(repository, prNumber, summary, versionLabel) {
    const commentBody = formatEvaluationReport(summary, versionLabel);
    if (prNumber) {
      await this.postPRComment(repository, prNumber, commentBody);
    } else {
      console.log("[eval] No pr_number provided, skipping PR comment.");
      console.log("[eval] Evaluation summary:\n", commentBody);
    }
    return commentBody;
  },

  async runEvaluationAndComment({
    repository,
    old_version = { ref: "main" },
    new_version = {},
    changed_files,
    eval_suites,
    pr_number,
  }) {
    const versionLabel =
      new_version?.commit_sha?.slice(0, 7) || new_version?.ref || "evaluation";

    try {
      console.log(
        `[evaluation] Starting background evaluation for ${repository} (${versionLabel})...`,
      );

      const summary = await evaluate({
        repository,
        old_version,
        new_version,
        changed_files,
        eval_suites,
      });

      console.log(
        `[evaluation] Evaluation completed successfully for ${repository} (${versionLabel}).`,
      );

      await this.postEvaluationComment(
        repository,
        pr_number,
        summary,
        versionLabel,
      );
      return summary;
    } catch (err) {
      console.error(
        `[evaluation] Background evaluation error for ${repository} (${versionLabel}):`,
        err.message,
      );

      if (pr_number) {
        const errComment = `## Evaluation Failed\n\nAn error occurred during evaluation for \`${versionLabel}\`:\n\`\`\`\n${err.message}\n\`\`\``;
        await this.postPRComment(repository, pr_number, errComment);
      }
      throw err;
    }
  },
};

export default githubService;
