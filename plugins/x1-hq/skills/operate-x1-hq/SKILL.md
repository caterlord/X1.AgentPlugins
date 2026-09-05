---
name: operate-x1-hq
description: Perform everyday X1 HQ operations across menus, prices, availability, online ordering, shops, devices, cash drawers, and other settings exposed by the connected gateway. Use for inspecting, diagnosing, importing, creating, updating, copying, enabling, disabling, or configuring X1 HQ, including multi-shop and multi-operation requests. For reporting-only analysis, use analyze-x1-hq-reports.
compatibility: Requires an Agent Plugins client with Agent Skills and Streamable HTTP MCP support, plus access to the X1 HQ MCP gateway.
metadata:
  author: X1
  version: "0.1.4"
---

# Operate X1 HQ

Act as the conversational operating surface for everyday X1 HQ work. Translate
the user's desired outcome into focused MCP operations, preserve their business
context, and make the final state easy to verify.

## Authority and boundaries

- Use only tools advertised by the connected X1 HQ MCP gateway.
- Treat current MCP schemas and returned structured content as authoritative.
- Never call raw X1 HQ APIs, construct direct HTTP requests, or run a script as
  a fallback for a missing, disabled, or failed MCP tool.
- Never imply that this skill grants access. Gateway scopes, workspace and
  tenant checks, approval policy, circuit breakers, and X1 HQ authorization
  decide what is allowed.
- Do not infer unsupported capabilities from the web application's UI.
- Read [references/capabilities.md](references/capabilities.md) when choosing
  tools or checking whether an operation is currently supported.

## Start every connection safely

Read [references/connection-and-access.md](references/connection-and-access.md)
before workspace bootstrap on a new connection or after any connection error.

1. Call `get_mcp_gateway_status` before planning the first operation on a new
   connection and whenever freshness or compatibility is uncertain. Use its
   operator-safe state; do not expose deployment details.
2. Call `bootstrap_hq_workspace` with every company, brand, or shop name the
   user supplied. It selects and persists a unique path without a business-
   change approval. Do not replace this step with instructions for the user to
   choose a workspace in the host UI.
3. If it returns `needs_selection`, ask one concise question using only the
   returned candidate paths, then call `bootstrap_hq_workspace` again with the
   user's choice. Never ask the user to confirm a unique workspace, company,
   brand, or shop merely to restate discovered context.
4. If the bootstrap tool is unavailable on an older gateway, use the compatible
   `list_hq_workspace_options` plus `commit_set_hq_workspace` sequence. Do not
   attempt a business read until one of these selection paths succeeds.
5. Treat a named company, brand, or shop that uniquely identifies one of
   several workspaces as a unique path and select it automatically.
6. Resolve later business names through discovery tools or
   `resolve_hq_scope_reference`. Never invent identifiers.
7. Reuse verified mappings only while the authenticated connection remains
   valid. Refresh after reconnect, revocation, permission change, or a gateway
   request to reselect workspace context.
8. Keep an existing selection when the user provides no contrary target. A
   uniquely resolved explicit target in another workspace is sufficient to
   change connection context; invalidate old previews and re-read before any
   business change. Restate the effective brand and shop in every
   business-change preview.

See [references/workspace-and-scope.md](references/workspace-and-scope.md) for
selection and ambiguity rules.

## Discover tools progressively

Prefer the exact task tool when it is callable. If the client has deferred or
omitted it, call `find_hq_tools` with a concise capability query, select only an
exact returned match, and invoke it through the returned
`call_hq_read_tool`, `call_hq_preview_tool`, or `call_hq_commit_tool` dispatcher.
Copy the returned `toolName` and follow its returned input schema; never guess a
hidden name or payload. A dispatcher does not weaken the target tool's scope,
workspace, preview, approval, idempotency, task, readback, or audit rules.

## Plan by user outcome

Break a multi-part request into an operation ledger before mutating anything:

```text
O1 | desired outcome | target scope | current-state read | preview | commit | dependencies | status
```

- Give each operation a stable identifier for the conversation.
- Ask only for information that blocks scope resolution or preview generation.
- Run independent reads and previews in parallel when the client permits it.
- Preserve dependencies. For example, resolve a menu item before previewing its
  price change.
- Do not let an unsupported operation prevent supported independent operations
  from being inspected or previewed.

Use [references/multi-operation-confirmation.md](references/multi-operation-confirmation.md)
for consolidation and partial-success rules.

## Maintain existing menus

For category, item, modifier-group or modifier-option renames, language placement,
POS/public/kitchen labels, metadata, prices, availability, classification, ordering,
and modifier/meal-set structure changes, use the typed maintenance
workflow in [references/menu-maintenance.md](references/menu-maintenance.md). Check
the connected gateway capabilities before choosing fields. Request
`get_menu_edit_context` with `includeExtended: true` for wider edits, and prefer one
`preview_menu_changes` change set for related changes to existing records.

## Read before write

- Inspect the relevant current state before proposing a change.
- Prefer task-oriented tools over low-level CRUD assumptions.
- Treat an authoritative no-op as complete without requesting approval or
  calling a commit tool.
- Treat diagnostic recommendations as information, not permission to mutate.
- For menu authoring and import work, follow
  [references/menu-operations.md](references/menu-operations.md).
- When the source is a PDF, image, spreadsheet, CSV, pasted menu, or another
  customer document, hand off extraction and the pre-import review loop to the
  `import-menu-from-document` skill.
- When an existing or just-imported catalog must be converted into a published
  Online Ordering menu and finished with a test QR, hand off that full workflow
  to the `publish-menu-online` skill.
- When the user wants to add or replace an Online Ordering item photo,
  online-category photo, shop logo, shop banner, or shop-list banner, use the
  image preview and approved immediate-commit flow in `publish-menu-online`.
- For device, store, online-ordering, or access-related work, follow
  [references/settings-devices-and-access.md](references/settings-devices-and-access.md).

## Preview and confirm business changes

1. Generate one authoritative preview for every supported business mutation.
2. Keep each preview's lineage separate even when several previews are shown in
   one confirmation.
3. Present every operation with its target, before-and-after values or affected
   count, exclusions, no-ops, warnings, assigned risk, and asynchronous status.
4. State that separate commits are not atomic.
5. Ask the user to approve all listed operation identifiers or name a subset.
6. Never fabricate an approval token or treat earlier general intent as approval
   for a newly generated preview.
7. If the user changes an operation after preview, discard that preview and
   create a new one.

## Commit, monitor, and verify

- Commit only approved, unchanged previews.
- Use one stable idempotency key per logical operation. If a commit response is
  uncertain, first recover its task or commit status and read back the target.
  Retry with that same key only when the returned recovery state explicitly
  says the original request was not consumed and is retryable.
- If the receiver says a request was consumed but its outcome is unknown, halt
  that operation. Do not create a replacement operation or repeat a relative
  mutation until authoritative reconciliation establishes the resulting state.
- Execute dependent commits in order. Independent approved commits may continue
  after a narrow failure only when the confirmation disclosed non-atomic
  execution.
- Stop pending writes on tenant or authentication integrity errors, approval or
  audit failures, a circuit breaker, or a broad service failure.
- Poll `get_task_status` until an asynchronous operation reaches a terminal
  state. `queued` and `running` are not completion.
- Read back every successful change before calling it verified.
- If reconciliation cannot determine a consumed request's outcome, report
  `committed-unverified` or `needs-review` and leave further writes stopped.
- Never perform a blind rollback. A reversal is a new change that requires a
  fresh read, preview, and approval.

## Report the exact outcome

Use one of these statuses for every requested operation:

- `verified`
- `committed-unverified`
- `no-change`
- `failed`
- `not-run`
- `needs-review`
- `unsupported`

Never claim the whole request succeeded unless every supported requested
operation is terminal and verified. Follow
[references/errors-and-recovery.md](references/errors-and-recovery.md) for error
handling and [references/response-patterns.md](references/response-patterns.md)
for concise operator-facing results.

## Hand off to reporting when needed

For requests such as "find slow sellers and raise their prices," first use
`analyze-x1-hq-reports` to identify evidence. Then start a fresh operational
read and preview for the selected items. Report findings are neither a mutation
preview nor approval.

For approved online-ordering publication, settings or photo previews, use the
matching commit tool with `approvalToken=user_explicitly_approved_final_preview`
only when its discovered schema advertises this handoff. The gateway issues the
real token internally; never request a token from the customer. Reuse the exact
preview and idempotency key for a submission retry. Photos run immediately.
