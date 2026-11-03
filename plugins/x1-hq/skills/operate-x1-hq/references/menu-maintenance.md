# Menu maintenance and post-import corrections

Use this flow for renames, catalog corrections, and related metadata, shop price,
availability, classification, ordering, modifier and meal-set edits. Discover the
exact named tools with `find_hq_tools` if deferred, and keep the same gateway.

1. Resolve the existing target with menu list/read tools. Read `get_menu_edit_context`
   for its entity ID, editable fields, field limits, version, and shared usage.
   `category`, `item`, and `modifier_group` are supported entity types. A standalone
   modifier option uses its existing `item` identity. Supported fields depend on
   the entity: do not manufacture field names or send full HQ update forms.
2. For a simple name edit, pass typed `set_names` operations to `preview_menu_changes`.
   For multi-turn work, use `start_menu_edit_session`, retain `editSessionId` and
   revision, then use `patch_menu_edit_session`/`get_menu_edit_session`. Each operation
   has an `operationId`, a resolved `target`, and `changes`. An omitted field stays
   unchanged, `{action: "set", value: "..."}` replaces it, and `{action: "clear"}`
   explicitly clears an optional field. Primary names cannot be cleared.
3. For a completed document import, initialize the session with `importTaskId` and
   `nameDisplayPolicy` instead of operations. The gateway restores verified record
   identities and original translations. It does not create missing records.
   Cross-workspace or missing/unverified lineage blocks correction. Linked options
   inherit the sellable item's naming authority; shared standalone options are
   coalesced by item identity. Conflicting names for one shared item must be resolved.
4. Call `preview_menu_changes` once for the selected session revision. Show the
   exact destination label, before/after values, and all affected shared usage.
   Follow `nextOffset` with `get_menu_change_preview` until it is null, keeping the
   same preview ID and digest. Fetching pages is not user approval: present every
   change before requesting approval. Never regenerate a preview just to see more.
5. If changes exist, obtain approval of that complete, unchanged preview. Use
   `approve_and_commit_menu_changes` with its preview ID, one stable idempotency
   key, and `approvalConfirmation: "user_explicitly_approved_final_preview"`.
   The tool handles its internal token and returns a task. Use `get_task_status`
   until terminal; a task marked succeeded can still contain `needs-review` results.
6. Report each outcome: `verified`, `no-change`, `committed-unverified`,
   `needs-review`, or `not-run`. All new change sets, including name-only edits, apply atomically in HQ.
   Previously saved legacy previews can still partially succeed. A lost
   response can still leave its outcome unverified. Recover an interrupted task with its original identity;
   never choose a new key to evade an uncertain outcome. A completed task with an
   uncertain write needs authoritative readback and a fresh correction preview.

A no-change preview needs no approval or commit. Changed intent or stale state
needs a new preview. Preview validity is 15 minutes; an accepted task can reconcile
and finish after that window. Sessions expire after 7 days and execution journals
retain recovery state for 90 days. Retain the original import task ID independently
of the editable import session. The service may reject a target whose complete
usage exceeds its limit; do not treat a truncated view as approval coverage.

Only explicitly selected fields change. Main/alternate language changes do not
synchronize kitchen, POS, public display, or remarks automatically. Shared item
names affect every listed group and parent item. Group-local wording, clone/relink,
prices, selection limits, ordering, availability and category membership require
the wider operation types below. A missing deployed maintenance endpoint is not permission to bypass MCP.

## Wider edits

Read `get_menu_edit_context` with `includeExtended: true` and resolved targets.
Require HQ contract `2.0.0`; absent support blocks this workflow. Include `shopId`
for shop detail reads and `itemId` for a group-member price read. Category context
includes its items and siblings, including disabled records, for complete ordering.
Use existing catalog and lookup tools to resolve any other referenced IDs.

Use the same session, immutable preview, page review, approval and task flow above.
Mix name operations and these typed operations in one `preview_menu_changes` call:

| Kind | Intent |
| --- | --- |
| `set_metadata` | Explicit field `set`/`clear`: category parent/style/visibility/enabled; item category/department/style/descriptions/serving size/preparation seconds/order-type flags/kitchen checklist/enabled; group selection limits/visibility/enabled. Only fields advertised for the target are accepted. |
| `set_price` | Item target + shopId + absolute price, nonnegative with up to two decimals. Missing shop details require this explicit price. |
| `set_availability` | Item + shopId, explicit enabled/outOfStock/limited/quantity/soldCount changes. Quantity/count require limited availability; turning it off resets them, shown in review. |
| `set_item_set_price` | Item + shopId; shared default Set Price across groups at that shop. Absolute price or explicit null to clear the default; group-specific overrides take priority. |
| `set_group_price` | Group + member itemId + shopId; price for this group only, or explicit null to disable its override and fall back to item Set Price/regular price. |
| `set_modifier_members` | Complete ordered members array of `{itemId, enabled}`. Removing members also removes their shop overrides. Shared parent usage is shown. |
| `set_item_modifiers` | Item + complete ordered groupIds. |
| `set_meal_set_groups` | Compatible item + complete ordered meal-set groupIds. |
| `set_classification` | Item classification: standard, modifier, set_item, or standalone_and_set. Review printer and relationship cleanup before approval. |
| `reorder_items` | Category target + every final member item ID in orderedIds, including disabled items. |
| `reorder_categories` | One sibling category target + every editable final sibling ID in orderedIds, including disabled categories. Omit reserved promotional categories; their order is preserved. Category display order applies wherever those categories appear. |

For Kitchen Checklist printing, use item `set_metadata` with
`changes.kitchenChecklist: {action: "set", value: true}` to enable it or `false`
to disable it. This is the existing `IsItemShowInKitchenChecklist` item field,
separate from kitchen names and shop printer routing. `clear` restores its blank
value. Read `get_menu_edit_context` with `includeExtended: true` and require the
returned `metadataFields.kitchenChecklist` capability before previewing. For many
items, put all selected item operations in one preview and review every change.

Collection arrays replace the selected collection; an empty array explicitly clears
it where valid. Do not infer missing members or drop disabled records. Group links
must be valid and cycle-free, and selection minimums must remain achievable.
Conflicting operations block the entire preview. HQ stages dependencies in a stable
order and displays indirect changes, including legacy price synchronization.

All wider changes commit in one HQ transaction after checking the frozen brand menu
version and effect digest. Any concurrent brand menu edit requires a fresh preview.
Prices and cleanup require authorization for every affected shop, including indirect
shop effects. Gateway recovery reads back the original absolute intent and final
state digest; do not resubmit uncertain work with a new identity.

The complete graph is bounded to 20,000 rows per menu/reference table. Wider context
is capped at 100 targets/1 MB and review at 10,000 field rows/4 MB. Oversized work
fails explicitly; reduce the change set or context rather than treating omitted
rows as reviewed. These tools update existing catalog identities. Creating or copying
items/groups/categories keeps its existing focused workflow.

## Item Set Price and group-specific prices

Choose the scope from the user's request before previewing a price change:

- **Item Set Price** is the default for this item across all groups at the selected shop. Use `set_item_set_price` with an `item` target, `shopId` and `price`. It writes the same setting as item `Shop Settings` -> `Additional Settings` -> `Set Price`. Do not loop over groups or change the regular selling price.
- **Group-specific price** applies only to this member item in one selected group at that shop. Use `set_group_price` with a `modifier_group` target, the member `itemId`, `shopId` and `price`. It leaves the item's shared Set Price and every other group unchanged.
- **Regular price** uses `set_price`. It is a separate setting from both prices above.

At each shop, the active group-specific price takes priority, followed by the item's Set Price, then its regular price. `0` is a valid price. For `set_item_set_price`, `price: null` clears the shared default and restores regular-price fallback. For `set_group_price`, `price: null` disables only that group's override and restores item Set Price/regular-price fallback.

Read `get_menu_edit_context` with `includeExtended: true` and the selected `shopId`. Require `capabilities.operations` to advertise `set_item_set_price` before using it. The `pricing` context shows the regular price, shared Set Price, active group overrides and precedence. Existing group overrides remain exceptions when changing the shared default; show them in the review. If the user explicitly wants one price in every group without exceptions, include explicit clears of those group overrides in the same approved preview. Do not silently remove overrides. If the requested scope is unclear, ask whether the user means all groups at this shop or one named group.

Example operation shapes (resolve the actual IDs before use):

```json
{"operationId":"shared-set-price","kind":"set_item_set_price","target":{"entityType":"item","entityId":101,"shopId":4},"price":5}
```

```json
{"operationId":"one-group-price","kind":"set_group_price","target":{"entityType":"modifier_group","entityId":501,"itemId":101,"shopId":4},"price":2}
```

Put related item and group price operations in one `preview_menu_changes` request. State the item, shop, scope, before/after values and retained group exceptions before asking for approval. Follow the ordinary approval, idempotency, task and readback flow. Repeat an item Set Price operation per explicitly selected shop; it does not affect every shop in the brand automatically.

## Focused bulk price and availability tools

Existing `preview_apply_menu_bulk_changes`, `preview_adjust_menu_prices`, and
`preview_update_menu_availability` previews must use their matching `commit_` tool.
They cannot be committed by `approve_and_commit_menu_changes`, which accepts only
`preview_menu_changes`. Use `get_hq_change_preview` to recover the exact commit
tool and read every page of a saved preview.

Printer routing can be previewed with `preview_update_menu_availability` using
`shopPrinter1` through `shopPrinter5`, or with `preview_menu_changes` using
`printer1` through `printer5`. Use the IDs returned after each approved printer
creation. Route only the intended shop's existing items, and review food and
drink matches before committing. Modifier items cannot own printer routes.

After the user approves the complete exact preview, the matching commit tool
accepts `approvalToken: "user_explicitly_approved_final_preview"` when its discovered
schema advertises that handoff. Keep one stable idempotency key. The gateway issues
and consumes the real token internally; never ask the customer for an API token.
Follow returned task IDs to completion. An approval or scope error is not a reason
to split a bulk operation into individual writes: resolve the error and preserve
the original preview/task identity, or create a fresh preview if it expired.

## Bulk mapping existing groups to existing items

Prefer one `preview_menu_changes` request with `modifierMappings`:

```json
{"brandId":17,"modifierMappings":{"itemIds":[101,102],"groupIds":[201,202],"mode":"add"}}
```

Use real resolved IDs. At most 100 items and 100 requested groups are accepted.
`add` preserves existing ordering and appends missing groups in the supplied order.
`replace` explicitly replaces the complete ordered list; an empty group list clears
it. Do not combine this form with operations or editSessionId. For heterogeneous
mapping intentions, use typed set_item_modifiers operations with complete final
lists, or a separate bulk request per identical intention.

The server batch-reads and freezes current relationships, resolves group names,
checks a consistent HQ version, and builds one atomic change set. Newly created
options/groups must be committed and their IDs verified before this step.
The default compact review lists each named item, its ordered before/after group
IDs, a group-name dictionary, shared usage and any item flag changes. Read every
page, including raw exception rows for unexpected/indirect effects. `view: "raw"`
on get_menu_change_preview exposes the full original audit diff. Switching views
changes the offset meaning; keep a single view while paging. No-change previews
need no commit. Approval uses the normal approve_and_commit_menu_changes flow.

Use `includeOperationSchema: false` on repeated get_menu_edit_context calls once
the schema is known. For task progress use `waitMs: 10000`; `includeResult: false`
omits large results, so fetch the terminal result once to verify all outcomes.
Do not re-run full menu diagnostics after the task already verified the mapping.

## Bulk execution and verification

Use one `preview_menu_changes` for existing-record edits, including names; do not
loop item previews or inject a dummy metadata edit to obtain atomic execution.
Name context is fetched in batches. Reuse schemas and request
`includeOperationSchema: false` after learning them. Price adjustments, availability,
category moves, and existing modifier-group authoring also batch their item edits.
Review every returned effect, including any shop defaults and relationship cleanup.
Collection reorder steps and import creation dependencies are separately disclosed
when combined with atomic edits. A terminal result explicitly marked verified is
sufficient readback; inspect only exceptions. `running` alone does not establish
healthy progress, and slow execution is never permission to resubmit.
