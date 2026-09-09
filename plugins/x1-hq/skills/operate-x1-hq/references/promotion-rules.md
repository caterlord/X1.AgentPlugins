# Promotion rules

Discover `preview_manage_combo_rule` and `commit_manage_combo_rule` together.
Check their live schemas before drafting: older gateways support only category
free/fixed-price benefits and cannot exchange an explicit approval attestation.
A missing mapper capability is an MCP limitation, not an HQ limitation.

## Establish the service behavior and complete offer

Reuse the user's stated service model. If it is unresolved and changes the design,
ask whether the drink/add-on must be selected with the meal or can be ordered or
changed later. A document's visual grouping does not establish modifier semantics.
For table service with later choices, inspect the promotion workflow before
creating modifiers. Preserve an explicit customer choice when both models fit.

Before the first preview, account for the entire offer: qualifying meals, named
free items, broader discounted categories, excluded categories, independent
add-ons versus alternatives, quantity limits, shops, days/times and channels.
Keep source requirements in `comboRule.requirements`, including unsupported ones;
use `kind: schedule`, `channel`, or `other` for constraints the mapper cannot enforce.
Do not reduce an unsupported requirement to a note and call the offer complete.
The returned requirement status means represented in the proposed configuration;
actual completion still requires successful commit and readback.

A required unsupported condition blocks commit. To deliberately narrow the scope,
record the customer's explicit decision with `disposition: exclude` and a meaningful
`exclusionReason`, then show a fresh preview including that exclusion. Answering an
extraction question or approving unrelated menu items is not that decision.

## Match HQ's mandatory and optional rules

- `trigger`: one existing category or item, quantity 1. This maps to HQ's
  mandatory condition. Use verified numeric HQ IDs for item references.
- `benefits`: use either `itemRefs` or `categoryRefs`, never both. Multiple refs
  become alternatives; none are silently discarded.
- `specificPrice` plus `categoryRefs`: match that exact original price within
  those categories (HQ BY_PRICE). It is not the price to charge and does not
  mean an upper/lower price threshold.
- `free_item` / `free_category`: sell as zero. `fixed_price` / `upgrade_price`:
  sell as `amount.amount`. `discount_amount`: deduct `amount.amount`.
  `discount_percent`: deduct `percent` (50 means 50% off), not a calculated
  fixed-price snapshot.
- `groupIndex` defaults to 0. All rules in one optional group are alternatives
  for one selection. Separate groups represent separate selections. Use one
  group for included and replacement drinks; use a separate group only when
  another selection, such as a cake add-on, is intended.
- `eligibility.shopRefs` limits the promotion to resolved brand shops; the
  preview must explicitly show which shops are enabled and disabled.

For “Lunch Menu mandatory; $30 drinks free, $40 drinks half price”, draft one
category trigger and two benefits in optional group 0: `free_category` with
`categoryRefs` and `specificPrice: 30`, then `discount_percent` with the applicable
`categoryRefs`, `specificPrice: 40`, and `percent: 50`. Resolve the actual prices
and eligible categories from the customer's request and current HQ context;
these numbers are examples, not defaults.

For named included drinks and “other drinks half price, excluding smoothies”,
resolve the named free items. If “other drinks” means whole categories, use
`categoryRefs` for those eligible categories and omit the excluded category;
future items in those categories then remain eligible. Use an explicit discounted
item list only when the customer intended a fixed list. Never widen named free
items to their whole category. Show which interpretation is in the preview.
Within a drink group, place the explicit free-item alternatives before broader
category discounts when free-item precedence is intended. HQ/POS preserves
alternative ordering; do not sort these details alphabetically or by discount.

Resolve each ID once per planning phase and reuse current read/discovery results.
Refresh after scope/connection changes or a stale-preview error. Omit optional
blank `code` and `name` reference fields; an empty string is not an identifier.

The current mapper blocks extra eligibility filters, generic exclusions,
quantities above one, spend thresholds, referenced schedules and free-text
limits. Channel restrictions are not enforced by HQ's promotion rule editor.
Creation sets no schedule; updates preserve the existing HQ schedule. A lunch
category does not enforce lunch hours. Preserve requested scheduling in the
requirement ledger; keeping an old schedule does not prove it matches new intent.

## Edit or disable an existing promo

Read `get_promotion_rule_editor` once with the brand and exact `promoHeaderId`.
Supply the verified brand `currency` when monetary benefits are present. Prefer
its `editableDraft` as the starting point. If it returns `editBlockers`, inspect
those and the raw editor; do not discard unsupported settings to force a draft.
Use `preview_manage_combo_rule` with `operation: "update"`, `promoHeaderId`, and
one complete canonical `comboRule` containing every intended trigger and benefit.
Update replaces the rule details on the same header. Existing HQ schedule,
priority, availability and other header settings are preserved. Omit
`eligibility.shopRefs` to preserve current shop scope; supply it only for an
intentional scope change. Review the full before/after preview.

For lunch drinks and cakes that can both be selected, retain one header with
drinks in optional group 0 and cakes in optional group 1. Keep free-item details
before category discounts when that is the intended HQ matching priority.
When the connected schema supports it, include the old IDs in
`retirePromoHeaderIds` on the retained header's update preview. Show every plan
step, its dependency and the non-atomic failure behavior together. One explicit
approval of that exact plan covers its listed steps. The gateway updates and
verifies the retained header before retiring old headers, stopping on failure.
If a step fails, read `get_hq_change_preview` and the affected HQ headers. Report
each step's returned status. Preview only remaining changes after reconciliation;
never rerun the whole plan with a new key or silently roll back completed steps.
On an older gateway, show separate supported previews together for approval and
execute the update, readback, then disable in that order. Do not create a third
header as an editing workaround. A stale target needs a fresh preview.

## Retrieve an existing preview

Use `get_hq_change_preview` for a saved preview ID, including promotions. Page
through the returned immutable diffs with its offset; retain the same ID.
Check `previewToolName`, `commitToolName`, expiry, approval status, requirements
and execution state. Do not pass a promo ID to `get_menu_change_preview`, which
is specialized for menu maintenance. If retrieval fails, say it is unverified;
never label a reconstructed conversational summary as the saved server preview.

## Approve and commit the same preview

A natural unambiguous approval of the displayed exact preview is sufficient; do
not demand that the customer type its UUID or a magic phrase.

Show the mandatory condition, every optional group and alternative, qualifying
prices versus benefits, shop scope, warnings and any unsupported conditions.
Commit only a supported, unchanged preview the customer explicitly approved.

When the discovered commit schema advertises it, call `commit_manage_combo_rule`
with that `previewId`, a stable `idempotencyKey`, and
`approvalToken: "user_explicitly_approved_final_preview"`. The gateway issues and
validates the real approval internally. Use the exact tool directly or through
`call_hq_commit_tool`; do not route a combo preview through
`approve_and_commit_menu_changes`, `approve_and_commit_menu_import`, or an item
approval helper. Never ask the customer for an approval token.

If the connected schema lacks this handoff, report the approval capability gap;
do not invent a token or create repeated replacement previews as a workaround.
For async submission, poll `get_task_status` on the same gateway until terminal.
Preserve the preview and idempotency key during recovery. A task acceptance is
not a completed promotion; a failed or uncertain response is not proof of no
writes. Only report verified success when `readbackVerified` is true. A partial
or mismatched result needs reconciliation before another write.
