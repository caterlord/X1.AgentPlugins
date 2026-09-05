# Changelog

## 0.7.1 — 2026-09-05

- Complete the public approval handoff for online publication, settings and image
  uploads; issue real tokens only inside the gateway after exact-preview approval.
- Preserve task deduplication, immediate-only photos, scope and expiry checks.
- Verify the connector dispatcher path in regression tests.

## 0.7.0 — 2026-09-05

- Extend the shared menu change-set workflow to metadata, item classification,
  shop prices and availability, group price overrides, modifier membership,
  item/group and meal-set mappings, and complete item/category ordering.
- Freeze every direct and indirect effect in one paged review. Wider changes use
  HQ contract 2.0.0 and one conditional transaction with verified readback.
- Preserve the existing name-only contract and focused tools. Recover interrupted
  mixed changes without blindly repeating writes; enforce frozen shop scope on replay.
- Validate schema unions and numeric precision in gateway input handling.

## 0.6.0

- Add typed category, item, modifier-group, and shared modifier-item name edits,
  with field-specific previews, explicit clearing, persisted sessions, and one
  approved background task. Preserve unrelated menu settings.
- Add draft 1.3 language display policies, including multiple languages in the
  primary field and a separate alternate field. Keep legacy 1.2 drafts valid.
- Correct completed imports using their verified task identities without creating
  replacement records. Require complete paged review and fresh approval.
- Check HQ versions atomically, stop on partial failure, and reconcile interrupted
  writes through persisted checkpoints without sending duplicate mutations.
- Complete the modifier-mapping GET dependency used by drink-set previews.
- Requires matching HQ maintenance API and gateway rollout; package presence
  alone does not establish deployed support.

## 0.5.0

- Add approval-gated JPG/PNG uploads for dedicated Online Ordering item images,
  three online-category image slots, and shop logo/banner/list-banner images.
- Bind each upload to previewed file size and SHA-256, validate its actual file
  signature at commit, execute immediately, and redact raw Base64 from audit
  records and asynchronous task storage.
- Add a dedicated `publish-menu-online` workflow for converting an existing or
  just-imported catalog into linked Online Ordering categories and a published
  menu combination for selected shops.
- Configure counter, preorder, or static-table ordering in the same approved
  publication, while preserving unrelated category, menu, shop, schedule, and
  channel state.
- Generate HQ-compatible counter, preorder, and existing static-table test QR
  codes after readback; require a table choice when several static tokens exist
  and never regenerate tokens implicitly.
- Extend the authenticated HQ route contract only for the menu-combination,
  smart-category, and table-token endpoints needed by this governed workflow.

## 0.4.3

- Add an operational-choice review that splits hot/iced drinks by default unless
  a required POS choice mechanism captures temperature on the order.
- Keep clarification state at the leaf-decision level so a price answer cannot
  silently resolve an item's role, category, spelling, selection limit, or
  channel.
- Flag empty extracted leaf categories and zero-priced sellable items, strengthen
  cross-language and embedded source-brand review, and default independent paid
  add-ons to multiple selection when no source limit is stated.
- Describe child records as blocked by unresolved dependencies instead of
  claiming the import endpoint does not support them, and require task polling
  through the same gateway instance that created the task.

## 0.4.2

- Add `approve_and_commit_menu_item` so an explicitly approved item create,
  update, or delete preview can be committed without exposing an approval
  token to the assistant.
- Keep the exact preview, requester, workspace, idempotency, downstream request
  binding, and audit checks on the new approval handoff.

## 0.4.1

- Replace the menu-specific bounded-catalog facade with `find_hq_tools` and
  separate read, preview, and commit dispatchers for every enabled HQ
  capability.
- Return exact live target schemas from discovery and revalidate delegated
  arguments before execution.
- Preserve each target tool's original scope, workspace, tenant, quota,
  approval, idempotency, task, readback, and audit behavior; prevent mode
  crossing and recursive dispatch.
- Expose `retry_task` for terminal failed tasks with `canRetry=true`, while
  rechecking the original write scope, requester, tenant, and idempotency
  lineage before enqueueing the next attempt.
- Apply the configured downstream HQ timeout to every router, raise the default
  from 10 to 30 seconds, and report an explicit timeout diagnostic instead of
  the opaque `This operation was aborted` message.

## 0.4.0

- Add `build_menu_import`, a stable pre-commit workflow facade that delegates
  schema discovery, authoring context, resumable sessions, validation, preview,
  and task monitoring to the existing governed tools.
- Keep menu import callable in clients that defer or expose only a bounded
  subset of a large MCP tool catalog, without weakening the separate explicit
  approval and commit boundary.
- Validate every facade payload against the delegated tool's current schema and
  retain the delegated tool name in responses and audit events.

## 0.3.9

- Add `bootstrap_hq_workspace` as the single mandatory connection bootstrap:
  it resolves customer-supplied company, brand, and shop names, persists a
  unique path automatically, and returns concise candidates only when the user
  must disambiguate.
- Keep the bootstrap callable in bounded client tool catalogs and retain the
  legacy workspace list-and-commit tools for compatibility.
- Prevent agents from sending customers to a host UI when conversational
  workspace selection is required.

## 0.3.8

- Map bilingual customer-facing item names to HQ `ItemNameAlt2` instead of the
  kitchen-name field, and preserve one-based source display ordering.
- Require natural English casing, semantic department selection, and a varied
  category-led button-style palette in document menu imports.
- Commit complete per-shop ItemShopDetail settings—including sale enablement,
  price, surcharge, stock defaults, and printer settings—through the same HQ
  persistence path used by item authoring.

## 0.3.7

- Add a required post-extraction spelling, translation, and OCR review that
  distinguishes clear transcription corrections from probable source typos
  that need customer confirmation.
- Preserve the HQ company market code through workspace discovery and selection
  so Hong Kong imports default to non-taxable even when the shop address or
  optional taxation lookup is unavailable.
- Clarify preview and import-session expiry recovery, and treat commit response
  decoding failures as indeterminate until authoritative readback reconciles
  the outcome.
- Make the legacy menu-import commit return one connector-safe tracked-task
  schema instead of a complex synchronous/asynchronous output union.

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
