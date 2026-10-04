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

export const composeProviders = (commit_sha, repository, ref) => {
  const { oldPlugins, newPlugins } = get2VersionPlugins(
    commit_sha,
    repository,
    ref,
  );
  const providers = [];
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

  providers.push({
    ...{ ...providerConfig, config: oldProviderConfig },
    label: "Old Version",
  });

  providers.push({
    ...{ ...providerConfig, config: newProviderConfig },
    label: `New version ${commit_sha}`,
  });

  return providers;
};

const get2VersionPlugins = (commit_sha, repository, ref) => {
  const repoUrl = `https://github.com/${repository}.git`;
  const sandboxDir = path.resolve(__dirname, "../../plugins-sanbox");
  const timestamp = Date.now();
  const oldVersionDir = path.join(sandboxDir, `old-${timestamp}`);
  const newVersionDir = path.join(sandboxDir, `new-${timestamp}`);

  // Clear sandbox directory before cloning
  if (fs.existsSync(sandboxDir)) {
    console.log(`[test-webhook] Clearing sandbox directory: ${sandboxDir}`);
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  }
  fs.mkdirSync(sandboxDir, { recursive: true });

  // Clone the latest main branch (old/baseline version)
  console.log(`[test-webhook] Cloning main branch into: ${oldVersionDir}`);
  execSync(
    `git clone --depth 1 --branch main "${repoUrl}" "${oldVersionDir}"`,
    { stdio: "inherit" },
  );

  // Clone the PR branch at the specific commit SHA (new version)
  console.log(
    `[test-webhook] Cloning branch '${ref}' at commit '${commit_sha}' into: ${newVersionDir}`,
  );
  execSync(`git clone --branch "${ref}" "${repoUrl}" "${newVersionDir}"`, {
    stdio: "inherit",
  });
  execSync(`git -C "${newVersionDir}" checkout "${commit_sha}"`, {
    stdio: "inherit",
  });

  console.log("[test-webhook] Clone completed successfully.");

  // Scan plugins/ directory in each version
  const oldPlugins = getPlugins(oldVersionDir);
  const newPlugins = getPlugins(newVersionDir);
  console.log(`[test-webhook] Old plugins (${oldPlugins.length}):`, oldPlugins);
  console.log(`[test-webhook] New plugins (${newPlugins.length}):`, newPlugins);
  return { oldPlugins, newPlugins };
};
