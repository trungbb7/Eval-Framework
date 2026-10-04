export const promtfooCofig = {
  description:
    "Evaluation suite for doc-review plugin (Claude Code Plugin Marketplace)",
  writeLatestResults: true,
  prompts: ["{{prompt}}"],

  defaultTest: {
    options: {
      transform: "output.toLowerCase()",
      provider: {
        id: "anthropic:claude-agent-sdk",
        label: "Judge Model Provider",
        config: {
          model: "claude-sonnet-5-5",
          apiKeyRequired: false,
        },
      },
    },
  },
};

export const providerConfig = {
  id: "anthropic:claude-agent-sdk",
  label: "Provider with plugin",
  config: {
    model: "claude-sonnet-5-5",
    apiKeyRequired: false,
    working_dir: "./working-dir",
    permission_mode: "acceptEdits",
    setting_sources: ["project", "local"],
    skills: "all",
    append_allowed_tools: ["*"],
  },
};
