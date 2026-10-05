import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { providerConfig } from "#src/evals/promptfooConfig.js";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Returns an array of absolute paths to each plugin inside
 * the `plugins/` directory of a cloned repo.
 * Each direct child directory of `<repoDir>/plugins/` is treated as one plugin.
 */
const getPlugins = (repoDir) => {
  const pluginsDir = path.join(repoDir, "plugins");
  if (!fs.existsSync(pluginsDir)) return [];
  return fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(pluginsDir, entry.name));
};

const composePluginsItem = (plugins) => {
  const pluginsItem = [];
  for (const plugin of plugins) {
    pluginsItem.push({
      type: "local",
      path: plugin,
    });
  }
  return pluginsItem;
};

export const composeProviders = (commit_shaOrOptions, repository, ref) => {
  let repo;
  let oldVersion = { ref: "main" };
  let newVersion = {};

  if (typeof commit_shaOrOptions === "object" && commit_shaOrOptions !== null) {
    repo = commit_shaOrOptions.repository;
    oldVersion = commit_shaOrOptions.old_version || { ref: "main" };
    newVersion = commit_shaOrOptions.new_version || {};
  } else {
    repo = repository;
    oldVersion = { ref: "main" };
    newVersion = { ref, commit_sha: commit_shaOrOptions };
  }

  const { oldPlugins, newPlugins, runDir } = get2VersionPlugins(
    repo,
    oldVersion,
    newVersion,
  );

  const oldPluginsItem = composePluginsItem(oldPlugins);
  const newPluginsItem = composePluginsItem(newPlugins);

  const oldProviderConfig = {
    ...providerConfig.config,
    plugins: oldPluginsItem,
  };

  const newProviderConfig = {
    ...providerConfig.config,
    plugins: newPluginsItem,
  };

  const oldLabel = oldVersion.commit_sha
    ? `Old Version (${oldVersion.commit_sha.slice(0, 7)})`
    : `Old Version${oldVersion.ref ? ` (${oldVersion.ref})` : ""}`;

  const newLabel = newVersion.commit_sha
    ? `New version ${newVersion.commit_sha.slice(0, 7)}`
    : `New version${newVersion.ref ? ` (${newVersion.ref})` : ""}`;

  const providers = [
    {
      ...providerConfig,
      config: oldProviderConfig,
      label: oldLabel,
    },
    {
      ...providerConfig,
      config: newProviderConfig,
      label: newLabel,
    },
  ];

  return { providers, runDir };
};

const cloneRepoVersion = (repoUrl, targetDir, version = {}) => {
  const { ref, commit_sha } = version;
  fs.mkdirSync(targetDir, { recursive: true });

  if (!ref && !commit_sha) {
    console.log(`[eval] Cloning default branch into: ${targetDir}`);
    execSync(`git clone --depth 1 "${repoUrl}" "${targetDir}"`, {
      stdio: "inherit",
    });
    return;
  }

  if (ref && !commit_sha) {
    console.log(`[eval] Cloning branch/tag '${ref}' into: ${targetDir}`);
    execSync(`git clone --depth 1 --branch "${ref}" "${repoUrl}" "${targetDir}"`, {
      stdio: "inherit",
    });
    return;
  }

  if (ref && commit_sha) {
    console.log(
      `[eval] Cloning branch '${ref}' at commit '${commit_sha}' into: ${targetDir}`,
    );
    execSync(`git clone --branch "${ref}" "${repoUrl}" "${targetDir}"`, {
      stdio: "inherit",
    });
    execSync(`git -C "${targetDir}" checkout "${commit_sha}"`, {
      stdio: "inherit",
    });
    return;
  }

  // Only commit_sha provided
  console.log(`[eval] Cloning repository and checking out commit '${commit_sha}' into: ${targetDir}`);
  execSync(`git clone "${repoUrl}" "${targetDir}"`, {
    stdio: "inherit",
  });
  execSync(`git -C "${targetDir}" checkout "${commit_sha}"`, {
    stdio: "inherit",
  });
};

const get2VersionPlugins = (repository, oldVersion, newVersion) => {
  const repoUrl = `https://github.com/${repository}.git`;
  const sandboxBaseDir = path.resolve(__dirname, "../../plugins-sanbox");
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const runDir = path.join(sandboxBaseDir, runId);
  const oldVersionDir = path.join(runDir, "old");
  const newVersionDir = path.join(runDir, "new");

  fs.mkdirSync(runDir, { recursive: true });

  console.log(`[eval] Preparing sandbox run: ${runId}`);
  cloneRepoVersion(repoUrl, oldVersionDir, oldVersion);
  cloneRepoVersion(repoUrl, newVersionDir, newVersion);

  console.log("[eval] Clone completed successfully.");

  const oldPlugins = getPlugins(oldVersionDir);
  const newPlugins = getPlugins(newVersionDir);
  console.log(`[eval] Old plugins (${oldPlugins.length}):`, oldPlugins);
  console.log(`[eval] New plugins (${newPlugins.length}):`, newPlugins);

  return { oldPlugins, newPlugins, runDir };
};
