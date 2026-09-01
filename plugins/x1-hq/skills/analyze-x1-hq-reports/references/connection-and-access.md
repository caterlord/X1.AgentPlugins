# Connection and report access

- Never ask the user to paste a credential, secret, key, or raw authorization
  value into chat.
- After bootstrap, name the selected workspace and summarize report access in
  plain language.
- Reuse workspace/company/brand/shop mappings verified earlier in the same
  active authenticated conversation.
- Collapse single-option hierarchy levels automatically. With one workspace and
  one company, do not ask for either when resolving a brand report. With one
  complete workspace/company/brand/shop path, do not ask for any scope level
  before a shop report.
- If several workspaces are available, a named company, brand, or shop that maps
  to exactly one hierarchy path is sufficient to select its workspace. Ask one
  concise question only when multiple required paths remain.
- Do not silently restore a prior workspace after reconnection. Refresh the
  hierarchy, then apply the same unique-path selection rules.
- If connection is required, expired, or revoked, ask the user to reconnect
  through the host connection flow.
- If the user's HQ role forbids a report, explain the permission boundary;
  reconnecting is not the remedy.
- If the gateway-to-HQ service credential is unavailable, describe a temporary
  X1 HQ outage. Never ask the user to reconnect or share credentials.
- Reservation guest details require separate consent. Continue non-sensitive
  reporting when that access is absent or declined.
- Workspace switching invalidates any operational preview created from the old
  context. A reporting result is still evidence only, never approval to change
  anything.
