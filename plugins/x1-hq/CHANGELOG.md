# Changelog

## 0.1.3

- Make the GitHub marketplace package workspace-native by referencing the
  registered `X1 HQ Agent` app with its `asdk_app_...` identifier.
- Mark the registered app as required so workspace admins receive an explicit
  dependency during import and access configuration.
- Keep portable Agent Plugins manifests outside the workspace-imported plugin
  directory so the imported plugin is not classified as desktop-only.
- Add a deterministic portable-package build that combines the shared skills
  with the Agent Plugins 1.0.0 manifests for release assets.

## 0.1.2

- Reuse workspace, company, brand, and shop mappings already verified during
  the active authenticated conversation.
- Automatically select uniquely resolved workspace paths and collapse
  single-option company, brand, and shop levels without redundant questions.
- Ask for scope clarification only when multiple matching hierarchy paths
  remain, with regression coverage for unique and duplicate-name cases.

## 0.1.1

- Bind the package to the verified `X1 HQ Agent` ChatGPT app registration.
- Certify the hosted ChatGPT OAuth flow with the declared read-only X1 scope
  set while keeping preview and commit scopes excluded.

## 0.1.0

- Add the Agent Plugins 1.0.0 portable manifest and Streamable HTTP MCP
  configuration.
- Add operator-centred daily-operations and reporting skills.
- Add generated capability references backed by the canonical MCP contracts.
- Add deterministic package, skill, security, and drift validation.
