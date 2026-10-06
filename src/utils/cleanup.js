import fs from "fs";

export const cleanup = (runDir) => {
  if (!runDir) return;
  try {
    fs.rmSync(runDir, { recursive: true, force: true });
    console.log(`[cleanup] Cleaned up run directory: ${runDir}`);
  } catch (err) {
    console.error(`[cleanup] Failed to clean up run directory: ${runDir}`);
  }
};
