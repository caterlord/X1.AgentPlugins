---
name: operate-x1-hq
description: Perform everyday X1 HQ operations across menus, prices, availability, online ordering, shops, devices, cash drawers, and other settings exposed by the connected gateway. Use for inspecting, diagnosing, importing, creating, updating, copying, enabling, disabling, or configuring X1 HQ, including multi-shop and multi-operation requests. For reporting-only analysis, use analyze-x1-hq-reports.
compatibility: Requires an Agent Plugins client with Agent Skills and Streamable HTTP MCP support, plus access to the X1 HQ MCP gateway.
metadata:
  author: X1
  version: "0.1.1"
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
2. Call `list_hq_workspace_options` on a new authenticated connection.
3. Build candidate workspace/company/brand/shop paths from the current
   selection, the user's explicit names, and hierarchy mappings already
   verified during this authenticated connection.
4. If exactly one candidate path remains at the level required by the request,
   select its workspace with `commit_set_hq_workspace` and infer every
   single-option parent level. This includes a named company, brand, or shop
   that uniquely identifies one of several workspaces. Workspace selection
   changes connection context; it is not an X1 HQ business-data mutation and
   does not need business-change approval.
5. Ask one concise question only when two or more candidate paths still match
   at a level the operation requires. Never ask the user to confirm a unique
   workspace, company, brand, or shop merely to restate discovered context.
6. Resolve business names through discovery tools or
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

## Read before write

- Inspect the relevant current state before proposing a change.
- Prefer task-oriented tools over low-level CRUD assumptions.
- Treat an authoritative no-op as complete without requesting approval or
  calling a commit tool.
- Treat diagnostic recommendations as information, not permission to mutate.
- For menu authoring and import work, follow
  [references/menu-operations.md](references/menu-operations.md).
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
