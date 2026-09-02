# Changelog

## 0.3.5

- Treat confirmed Hong Kong menu imports as non-taxable even when the optional
  HQ taxation lookup is unavailable, unless an authoritative active setting
  explicitly conflicts.
- Let older connector action snapshots hand off an explicitly approved final
  menu preview through `commit_import_menu_catalog`; the gateway converts the
  fixed attestation into the same server-issued, one-time approval used by the
  atomic commit tool, without exposing the real token.

## 0.3.4

- Generate collision-checked category and item codes during preview whenever a
  source menu omits them, freeze the exact codes for commit, and show codes for
  categories, sellable items, and standalone or linked modifier options.
- Split independently orderable quantity or size prices into separate sellable
  items by default, with the distinguishing quantity in each operational name.
- Model removable components of mixed dishes as zero-price omission modifiers.
- Derive combo-component options from explicit sibling-item ranges and
  exclusions, using concise component names instead of linking complete dishes.
- Default silent channels to disabled, resolve Hong Kong no-tax imports without
  a customer question, and omit redundant base-price role markers.

## 0.3.3

- Add the resumable `import-menu-from-document` skill and complete table-form
  customer review before approval.
- Import categories, sellable items, modifier options, modifier groups,
  exceptional group price overrides, and item mappings in one dependency-aware
  operation.
- Add `approve_and_commit_menu_import`, which queues the customer-approved
  import while issuing and consuming its approval token entirely inside the
  gateway.
- Keep approval tokens out of assistant inputs, outputs, task payloads, and
  audit metadata.

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
