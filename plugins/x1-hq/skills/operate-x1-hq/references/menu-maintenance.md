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
   `needs-review`, or `not-run`. Name-only execution can partially succeed.
   A change set containing any wider operation applies atomically in HQ; a lost
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
| `set_metadata` | Explicit field `set`/`clear`: category parent/style/visibility/enabled; item category/department/style/descriptions/serving size/preparation seconds/order-type flags/enabled; group selection limits/visibility/enabled. Only fields advertised for the target are accepted. |
| `set_price` | Item target + shopId + absolute price, nonnegative with up to two decimals. Missing shop details require this explicit price. |
| `set_availability` | Item + shopId, explicit enabled/outOfStock/limited/quantity/soldCount changes. Quantity/count require limited availability; turning it off resets them, shown in review. |
| `set_group_price` | Group + member itemId + shopId; absolute price or explicit null to disable the override. |
| `set_modifier_members` | Complete ordered members array of `{itemId, enabled}`. Removing members also removes their shop overrides. Shared parent usage is shown. |
| `set_item_modifiers` | Item + complete ordered groupIds. |
| `set_meal_set_groups` | Compatible item + complete ordered meal-set groupIds. |
| `set_classification` | Item classification: standard, modifier, set_item, or standalone_and_set. Review printer and relationship cleanup before approval. |
| `reorder_items` | Category target + every final member item ID in orderedIds, including disabled items. |
| `reorder_categories` | One sibling category target + every editable final sibling ID in orderedIds, including disabled categories. Omit reserved promotional categories; their order is preserved. Category display order applies wherever those categories appear. |

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
