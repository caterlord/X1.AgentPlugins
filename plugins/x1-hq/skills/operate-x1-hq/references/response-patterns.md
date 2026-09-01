# Response patterns

## Completed request

Lead with the verified business result. Then list operation identifiers, targets,
and concise before-and-after facts. Mention warnings only when they affect what
the operator should do next.

## Partial result

```text
Completed 2 of 3 operations.

- O1 verified — Cash drawer renamed at Shop A.
- O2 failed — Price state changed after preview; no price changes were made.
- O3 verified — Online-order token validity updated at Shop A.

O2 needs a refreshed preview before it can be retried.
```

## Unsupported mixed request

Separate unsupported work from supported work. Offer the safe inspection or
supported preview that exists, without implying the unavailable operation will
be completed later automatically.
