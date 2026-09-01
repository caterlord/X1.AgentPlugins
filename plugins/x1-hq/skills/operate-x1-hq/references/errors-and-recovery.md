# Errors and recovery

| Condition | Required behaviour |
| --- | --- |
| Invalid input | Correct the input, then create a new preview. |
| Connection required, expired, or revoked | Ask the user to reconnect through the host connection flow. |
| Additional consent required | Explain the exact capability needed; continue permitted read-only work if declined. |
| Workspace selection required | Run workspace bootstrap; do not invent scope. |
| Workspace re-selection required | Re-run bootstrap and discard affected previews and approvals. |
| HQ permission denied | Explain the user's current role boundary; do not suggest reconnecting. |
| Resource not found | Refresh discovery and resolve the user's name again. |
| Preview conflict | Re-read current state, resolve the conflict, and re-preview. |
| Preview expired | Re-preview and obtain fresh approval. |
| Approval required | Present the authoritative preview and use the supported approval flow. |
| Rate limited | Respect retry guidance and avoid repeated calls. |
| Downstream unavailable | Do not claim mutation state; verify before any retry. |
| HQ service credential unavailable | Report a service outage; never ask the user to reconnect or share credentials. |
| Async task failed | Report the error and retry eligibility; preserve idempotency. |
| Missing or disabled tool | State that the capability is unavailable; never use raw APIs. |
| Circuit breaker or read-only mode | Stop affected writes and report that no bypass was attempted. |
| Policy epoch mismatch | Re-read, re-preview, and request fresh approval. |
| Request binding mismatch | Treat the approval lineage as unsafe. Do not retry the mutation. Re-read current state, create a new preview, and request fresh approval. |
| Request already consumed; outcome known | Recover the existing task or commit result, read back the target, and report that operation. Do not dispatch a replacement. |
| Request already consumed; outcome unknown | Halt the operation and reconcile through task/commit status plus authoritative readback. Do not retry, create a new logical operation, or repeat a relative mutation while the outcome remains unknown. Report `committed-unverified` or `needs-review` if reconciliation cannot establish the result. |

If a commit response is lost or ambiguous, recover status and verify current
state before considering a retry. Reuse the same idempotency key only when the
recovery response explicitly says the original request was not consumed and is
retryable. After a consumed/replay response, a fresh preview is safe only once
reconciliation has established the resulting state; otherwise stop for review.
