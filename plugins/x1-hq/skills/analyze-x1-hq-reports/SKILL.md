---
name: analyze-x1-hq-reports
description: Analyze X1 HQ sales, item and category performance, payments, order details, operational exceptions, and period comparisons. Use for reporting, performance questions, trends, rankings, anomalies, investigations, and business summaries. This skill is read-only; use operate-x1-hq for any resulting menu or configuration change.
compatibility: Requires an Agent Plugins client with Agent Skills and Streamable HTTP MCP support, plus access to the X1 HQ MCP gateway.
metadata:
  author: X1
  version: "0.1.1"
---

# Analyze X1 HQ reports

Answer operational and performance questions from normalized X1 HQ reporting
tools. Keep facts, caveats, inference, and recommendations distinct.

## Authority and boundaries

- Use only report tools advertised by the connected X1 HQ MCP gateway.
- Treat current MCP schemas and structured results as authoritative.
- Never call raw X1 HQ APIs or reconstruct a report from guessed endpoints.
- This skill is read-only. A requested change activates `operate-x1-hq` and
  starts a fresh inspect, preview, approval, commit, and verification workflow.
- `commit_set_hq_workspace` and the other workspace-selection context tools may
  persist connection context, but they do not mutate X1 HQ business data and do
  not require business-change approval.
- Read [references/capabilities.md](references/capabilities.md) when routing a
  report request.

## Establish scope

Read [references/connection-and-access.md](references/connection-and-access.md)
on a new connection or after a connection error.

1. Call `get_mcp_gateway_status`, then on a new authenticated connection call
   `list_hq_workspace_options` and
   select the intended workspace with `commit_set_hq_workspace`.
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
2. Select the narrowest normalized report tool that answers the question.
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
