# Changelog

## 0.3.6

- Define modifier-group POS and Online Ordering availability once on the group
  header through `isPosDisplay` and `isOdoDisplay`; every mapped item inherits
  those settings.
- Reject per-item mapping channel assertions that conflict with the modifier
  group header, and derive document-import mapping payloads and verification
  from the committed group settings.

## 0.3.5

- Treat confirmed Hong Kong menu imports as non-taxable even when the optional
  HQ taxation lookup is unavailable, unless an authoritative active setting
  explicitly conflicts.
- Let older connector action snapshots hand off an explicitly approved final
  menu preview through `commit_import_menu_catalog`; the gateway converts the
  fixed attestation into the same server-issued, one-time approval used by the
  atomic commit tool, without exposing the real token.
- Complete the atomic import as a tracked in-request task when authenticated
  asynchronous execution is unavailable, preserving current-request credential
  revalidation without changing the task-status contract.

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

- Add `approve_and_commit_menu_import` as the customer-approved menu import
  handoff, with asynchronous execution and server-side approval issuance and
  consumption.
- Keep the approval token out of MCP inputs, outputs, task payloads, and audit
  metadata, while retaining the lower-level commit contract for compatibility.
- Direct the document-import skill to use the atomic handoff only after showing
  the exact final preview and receiving explicit customer approval.

## 0.3.2

- Return a complete table-form customer review from document-menu previews.
- Require the Agent to display every proposed category, item, modifier, price,
  mapping, and exclusion before saying an import is ready or requesting
  approval.

## 0.3.1

- Keep ordinary modifier option prices on the shared modifier item and use
  group-specific price overrides only for explicitly identified exceptions.
- Reuse the same modifier item across groups and require clarification when a
  source proposes multiple normal prices without identifying the exception.

## 0.3.0

- Include accepted modifier options, option prices, modifier groups, and
  item-to-group mappings in the same document-menu import preview and approved
  commit as categories and sellable items.
- Execute the approved catalog graph in dependency order without requesting
  separate category, item, or modifier approvals.

## 0.2.2

- Create new HQ item categories during document-menu import before creating
  dependent items, with readback verification and no dummy-folder remapping.

## 0.2.1

- Resolve tax intent from the confirmed target jurisdiction and HQ taxation
  context, treating Hong Kong menu imports as non-taxable when no active
  taxation exists instead of asking customers about sales tax.

## 0.2.0

- Add a focused document-menu import skill covering extraction, evidence,
  resumable draft sessions, clarification, and preview handoff.
- Publish the complete canonical draft schema and distinguish canonical draft
  item types from downstream HQ item types.
- Preserve localized names, units, quantities, source variants, printed
  business identity, channel intent, and tax intent in menu drafts.
- Add deduplicated, structured review questions and a bilingual PDF-derived
  regression fixture.
- Keep non-mutating previews available in gateway read-only mode while all
  business commits remain blocked.

## 0.1.4

- Preserve menu-item `modifiedBy` and `modifiedDate` metadata in item-list
  results.
- Provide explicit `disabledBy` and `disabledAt` convenience fields for
  disabled items, labelled as inferred from the latest modification rather
  than a discrete audit event.

## 0.1.3

- Reuse workspace, company, brand, and shop mappings already verified during
  the active authenticated conversation.
- Automatically select uniquely resolved workspace paths and collapse
  single-option company, brand, and shop levels without redundant questions.
- Ask for scope clarification only when multiple matching hierarchy paths
  remain, with regression coverage for unique and duplicate-name cases.

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
