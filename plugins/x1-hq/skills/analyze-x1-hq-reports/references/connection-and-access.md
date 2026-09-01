# Connection and report access

- Never ask the user to paste a credential, secret, key, or raw authorization
  value into chat.
- After bootstrap, name the selected workspace and summarize report access in
  plain language.
- If several workspaces are available, ask one concise question before reading
  business data. Do not silently restore a prior workspace after reconnection.
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
