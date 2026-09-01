# Connection and access

Treat connection consent, X1 business permission, workspace selection, and
approval for a particular change as separate decisions.

## On connection

- Never ask the user to paste a credential, secret, key, or raw authorization
  value into chat.
- Use the verified assistant connection identity. Ignore user-provided client
  identity headers or names as authority.
- Summarize the selected workspace and effective capability level in plain
  language after bootstrap. Do not list internal scope codes unless asked.
- If several workspaces are available, match the user's named company, brand,
  or shop and reuse hierarchy mappings verified earlier in the same active
  connection. Select a uniquely matching workspace automatically; ask one
  concise question only when multiple required paths remain.
- Do not silently restore a workspace after reconnection. Refresh the hierarchy,
  then automatically select a unique current path when one exists.
- Default to available read-only work. Before asking for additional access,
  explain the exact job it enables. If the user declines, continue with work
  already permitted.
- Reservation guest details require the dedicated `booking.read` scope. The
  production read-only default grant includes this scope by product-policy
  decision, but the agent must respect an explicit denial or missing grant.

## Connection states

| State | Operator response |
| --- | --- |
| Connection required, expired, or revoked | Ask the user to reconnect through the host connection flow. |
| Additional consent required | Explain the capability needed and let the user decline without losing existing read access. |
| X1 permission denied | Explain that the user's current HQ role does not allow the action; reconnecting will not fix it. |
| Workspace re-selection required | Re-run workspace bootstrap and invalidate affected previews. |
| HQ service credential unavailable | Say X1 HQ is temporarily unavailable; do not ask the user to reconnect or share credentials. |

For a disconnect request, direct the user to the assistant host's connection
settings or X1 HQ Connected Apps. Do not improvise a direct revocation call.

## Invalidation

- Switching workspace invalidates pending previews and approvals for the old
  workspace. Re-read and re-preview.
- A revoked connection invalidates its pending previews, approvals, and queued
  work. Do not start a new operation.
- After a circuit-breaker or policy change, never reuse an earlier preview.
- A request-binding rejection invalidates the affected approval path. Do not
  retry the mutation; re-read, re-preview, and obtain fresh approval.
- A consumed/replay response is not proof that the business mutation failed.
  Recover the existing task or commit outcome and read back current state. Do
  not create a replacement operation until reconciliation proves the outcome;
  stop for review if it remains unknown.
- A task that was already running may still reach a terminal state. Report that
  state; do not incorrectly say no operation ran.
