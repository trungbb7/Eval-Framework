import fetch from "node-fetch";
import { evaluate } from "#src/evals/promptfoo.js";

export const postPRComment = async (repository, prNumber, body) => {
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
};

export const sendPRComment = async (
  changed_files,
  commit_sha,
  repository,
  ref,
  pr_number,
) => {
  try {
    console.log("[test-webhook] Starting background evaluation...");
    const summary = await evaluate(changed_files, commit_sha, repository, ref);

    // Data is in summary.prompts[], one entry per provider
    const oldPrompt = summary?.prompts?.find(
      (p) => p.provider === "Old Version",
    );
    const newPrompt = summary?.prompts?.find((p) =>
      p.provider?.startsWith("New version"),
    );

    const oldM = oldPrompt?.metrics ?? {};
    const newM = newPrompt?.metrics ?? {};

    const fmt = (n) => (n == null ? "—" : String(n));
    const fmtScore = (n) => (n == null ? "—" : n.toFixed(2));
    const fmtCost = (n) => (n == null ? "—" : `$${n.toFixed(4)}`);
    const fmtMs = (n) => (n == null ? "—" : `${(n / 1000).toFixed(1)}s`);
    const delta = (nv, ov) => {
      if (nv == null || ov == null) return "";
      const d = nv - ov;
      if (d === 0) return " _(=)_";
      return d > 0
        ? ` _(+${d.toFixed(2)})_`
        : ` _(-${Math.abs(d).toFixed(2)})_`;
    };

    // Collect all named score keys from both versions
    const allNamedKeys = [
      ...new Set([
        ...Object.keys(oldM.namedScores ?? {}),
        ...Object.keys(newM.namedScores ?? {}),
      ]),
    ];

    const namedScoreRows = allNamedKeys.map((key) => {
      const ov = oldM.namedScores?.[key];
      const nv = newM.namedScores?.[key];
      const trend = nv > ov ? "🟢" : nv < ov ? "🔴" : "⚪";
      return `| ${trend} ${key} | ${fmt(ov)} | ${fmt(nv)} |`;
    });

    const overallVerdict =
      (newM.score ?? 0) >= (oldM.score ?? 0)
        ? "🟢 New version performs **at least as well** as the baseline."
        : "🔴 New version performs **worse** than the baseline.";

    const commentBody = [
      `## Evaluation Report for \`${commit_sha.slice(0, 7)}\``,
      ``,
      `### Overall Comparison`,
      ``,
      `| Metric | Old Version | New Version |`,
      `|--------|:-----------:|:-----------:|`,
      `| Score | ${fmtScore(oldM.score)} | ${fmtScore(newM.score)}${delta(newM.score, oldM.score)} |`,
      `| Tests Passed | ${fmt(oldM.testPassCount)} | ${fmt(newM.testPassCount)} |`,
      `| Tests Failed | ${fmt(oldM.testFailCount)} | ${fmt(newM.testFailCount)} |`,
      `| Assertions Passed | ${fmt(oldM.assertPassCount)} | ${fmt(newM.assertPassCount)} |`,
      `| Assertions Failed | ${fmt(oldM.assertFailCount)} | ${fmt(newM.assertFailCount)} |`,
      `| Latency | ${fmtMs(oldM.totalLatencyMs)} | ${fmtMs(newM.totalLatencyMs)} |`,
      `| Cost | ${fmtCost(oldM.cost)} | ${fmtCost(newM.cost)} |`,
      ``,
      `### Named Score Breakdown`,
      ``,
      `| Criterion | Old Version | New Version |`,
      `|-----------|:-----------:|:-----------:|`,
      ...namedScoreRows,
      ``,
      `> ${overallVerdict}`,
    ].join("\n");

    if (pr_number) {
      await postPRComment(repository, pr_number, commentBody);
    } else {
      console.log("[test-webhook] No pr_number provided, skipping PR comment.");
      console.log("[test-webhook] Evaluation summary:\n", commentBody);
    }
  } catch (err) {
    console.error("[test-webhook] Background evaluation error:", err.message);

    if (pr_number) {
      const errComment = `## ❌ Evaluation Failed\n\nAn error occurred during evaluation for commit \`${commit_sha.slice(0, 7)}\`:\n\`\`\`\n${err.message}\n\`\`\``;
      await postPRComment(repository, pr_number, errComment).catch((e) =>
        console.error(
          "[test-webhook] Failed to post error comment:",
          e.message,
        ),
      );
    }
  }
};
