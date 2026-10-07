export const formatEvaluationReport = (summary, versionLabel = "") => {
  const oldPrompt = summary?.prompts?.find((p) =>
    p.provider?.startsWith("Old Version"),
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
    return d > 0 ? ` _(+${d.toFixed(2)})_` : ` _(-${Math.abs(d).toFixed(2)})_`;
  };

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

  const titleSuffix = versionLabel ? ` for \`${versionLabel}\`` : "";

  const resultUIUrl = `${process.env.PROMPTFOO_UI_URL}/eval/${summary.id}`;

  return [
    `## Evaluation Report${titleSuffix}`,
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
    ``,
    `[View full results](${resultUIUrl})`,
  ].join("\n");
};
