# Multi-operation confirmation

One conversational confirmation may cover several previews, but each underlying
operation retains its own preview, approval lineage, idempotency key, commit, and
verification result.

## Confirmation format

```text
Ready to apply 3 independent changes:

O1 — Shop A: rename cash drawer CD-01 from “Front” to “Main Counter” [low]
O2 — Shop B: increase 12 Hot Drinks by HKD 1; 2 items excluded [medium]
O3 — Shop A: change online-order token validity from 15 to 20 minutes [low]

These changes commit independently. Approve all, or name the operation numbers to approve.
```

Do not collapse warnings, risk, exclusions, target shops, or before-and-after
values into a single total.

## Execution policy

- Independent reads and previews may run in parallel.
- Commits preserve dependency order.
- A narrow failure stops its dependent operations.
- Independent approved operations may continue only when non-atomic execution
  was disclosed.
- Authentication, tenant-integrity, approval, audit, or broad service failures
  halt all pending writes.
- Never automatically undo an earlier success. Reversal requires a new preview.
