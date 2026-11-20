---
name: analyze-x1-hq-reports
description: Analyze X1 HQ sales, item and category performance, payments, order details, operational exceptions, and period comparisons. Use for reporting, performance questions, trends, rankings, anomalies, investigations, and business summaries. This skill is read-only; use operate-x1-hq for any resulting menu or configuration change.
compatibility: Requires an Agent Plugins client with Agent Skills and Streamable HTTP MCP support, plus access to the X1 HQ MCP gateway.
metadata:
  author: X1
  version: "0.2.0"
---

# Analyze X1 HQ reports

Answer operational and performance questions from normalized X1 HQ reporting
tools. Keep facts, caveats, inference, and recommendations distinct.

## Connection binding

Use the direct MCP server `x1-hq` at `https://mcp.posx1.ai/mcp` for this
package. Keep status, discovery, workspace, and business calls on that server.
The **X1 HQ Agent** app connector (`codex_apps/x1_hq_agent`) is a separate
connection. Do not substitute its tools or tools from another X1 environment
when a packaged-server tool is deferred.

If a tool is deferred, discover it through this server's `find_hq_tools` and
use its matching dispatcher. If the task exposes no tools from this server,
report that specific tooling limitation. An error from another connector does
not establish that this gateway is unavailable.

## Authority and boundaries

- Use only report tools advertised by the connected X1 HQ MCP gateway.
- Treat current MCP schemas and structured results as authoritative.
- Never call raw X1 HQ APIs or reconstruct a report from guessed endpoints.
- This skill is read-only. A requested change activates `operate-x1-hq` and
  starts a fresh inspect, preview, approval, commit, and verification workflow.
- `bootstrap_hq_workspace` and the other workspace-selection context tools may
  persist connection context, but they do not mutate X1 HQ business data and do
  not require business-change approval.
- Read [references/capabilities.md](references/capabilities.md) when routing a
  report request.

## Run reports in the background

After resolving the workspace and report filters, submit every supported report through
`call_hq_read_tool`, including short periods and reports exposed as direct tools.
This applies to each report in a multi-report answer and to an explicitly requested
reservation board with `booking.read`. Use `find_hq_tools` to resolve an unfamiliar
report name or input schema.

1. Pass `toolName`, the report's original `arguments`, and a fresh `reportRequestId`
   as sibling fields. Use one request ID per report. If a submission response is lost,
   retry with the same ID, tool, arguments and selected scope.
2. Keep the returned `result.taskId`. Check `get_task_status` with that ID,
   `waitMs=0` and `includeResult=false`. If status is available only through
   `call_hq_read_tool`, dispatch it without a report request ID.
3. On success, request `includeResult=true`. Read `result.report` and pass each
   `result.nextOffset` as `reportOffset` until the requested detail is covered or
   the offset is null. Count repeated summary totals once. Preserve HQ's row limits,
   truncation flags, currency and coverage caveats.
4. While queued or running, keep the ID for the next check. If the turn ends,
   give the user the ID so they can resume within 24 hours in the same scope.
   On failure or changed access, surface the gateway's explanation. Only submit
   a fresh job when a new run is needed.

If the connected gateway's dispatcher schema lacks `reportRequestId`, use its
advertised synchronous report workflow and explain the compatibility fallback.
A slow response or an existing task ID is a reason to resume the same request.

## Establish scope

Read [references/connection-and-access.md](references/connection-and-access.md)
on a new connection or after a connection error.

1. Call `get_mcp_gateway_status`, then call `bootstrap_hq_workspace` with any
   company, brand, or shop name supplied by the user. It automatically persists
   a unique match; ask one concise question only when it returns
   `needs_selection`. Use `list_hq_workspace_options` plus
   `commit_set_hq_workspace` only as an older-gateway compatibility fallback.
2. Build candidate hierarchy paths from explicit names, the current selection,
   and mappings already verified in this authenticated conversation. Infer every
   single-option workspace, company, brand, and shop level automatically.
3. A company, brand, or shop that uniquely identifies one of several
   workspaces is sufficient to select that workspace. Do not ask the user to
   reconfirm unique parent levels.
4. Resolve named companies, brands, and shops. Never invent identifiers.
5. State the effective company, brand, shops, and currency in financial answers.
6. Ask one concise disambiguation question only when multiple candidate paths
   remain at a level the report requires.

## Resolve the reporting question

1. Convert relative periods into exact dates using the user's locale and current
   date, then echo those dates in the answer.
2. Select the normalized reports needed to answer the requested level of detail.
   For a sales report or breakdown, read the report-routing reference and include
   item and category performance; a headline summary alone is insufficient.
3. Prefer an existing task-level summary or comparison over rebuilding the same
   metric from lower-level rows.
4. Handle empty, partial, caveated, and truncated results explicitly.
5. Label any inference and explain what evidence supports it.

Use [references/report-routing.md](references/report-routing.md) for tool choice
and [references/dates-metrics-and-caveats.md](references/dates-metrics-and-caveats.md)
for analytical presentation.

## Protect sensitive information

Booking guest data requires its dedicated scope and an explicit reservation-board
request. Minimize repeated names, phone numbers, and email addresses. Never use
guest data merely because it is available.

Follow [references/privacy-and-operational-handoff.md](references/privacy-and-operational-handoff.md)
when a report leads to an operational recommendation.

For a report-to-operation request, preserve the report period, scope, evidence,
selected records, recommendation, preview, and verified operation result in one
combined response. Report findings are neither mutation previews nor approval.

## Answer clearly

- Lead with the decision-relevant finding.
- Include exact period, scope, currency, and material caveats.
- Separate returned facts from interpretation.
- Do not describe queued or incomplete data as final.
- When recommending a change, name it as a recommendation. Do not imply it was
  previewed, approved, or applied.
