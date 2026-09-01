# Privacy and operational handoff

Use sensitive booking information only for an explicit reservation-board task
and only when the authenticated user has the dedicated scope. Minimize repeated
PII in summaries and do not carry it into unrelated analysis.

When a report suggests an operational action:

1. Explain the evidence and recommendation.
2. Activate `operate-x1-hq` if the user asks to proceed.
3. Re-read current operational state because report results are not a mutation
   snapshot.
4. Generate a fresh preview and obtain approval.
5. Keep one handoff ledger linking the exact report period and scope, supporting
   evidence, selected records, recommendation, operational preview identifier,
   commit result, and readback verification.
6. Return one consolidated answer that separates the analytical finding from
   the approved operational outcome. Do not make the user reconstruct the job
   from two disconnected summaries.

A report result never substitutes for preview lineage or approval.
