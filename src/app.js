import express from "express";
import { evaluate } from "#src/evals/promptfoo.js";
import { sendPRComment } from "#src/utils/githubUtil.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/evaluate", async (req, res) => {
  try {
    const { changed_files } = req.body || {};
    const rs = await evaluate(changed_files || []);
    res.json(rs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/evaluate", async (req, res) => {
  try {
    const { changed_files } = req.body || {};
    const rs = await evaluate(changed_files || []);
    res.json(rs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/test-webhook", async (req, res) => {
  const body = req.body;
  console.log("[test-webhook] Received body:", JSON.stringify(body, null, 2));

  const { changed_files, commit_sha, repository, ref, pr_number } = body || {};

  if (!changed_files) {
    return res.status(204).end();
  }

  if (!commit_sha || !repository || !ref) {
    return res.status(400).json({
      error: "Missing required fields: commit_sha, repository, ref",
    });
  }

  res
    .status(202)
    .json({ message: "Evaluation started, result will be posted to PR." });

  sendPRComment(changed_files, commit_sha, repository, ref, pr_number).catch(
    (e) => console.error("Failed to post PR comment:", e.message),
  );
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
