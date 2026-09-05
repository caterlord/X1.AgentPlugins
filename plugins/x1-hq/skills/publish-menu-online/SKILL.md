---
name: publish-menu-online
description: Convert an existing or just-imported X1 HQ catalog into a published online-ordering menu, optionally upload customer-facing item, category, and shop photos, configure counter, preorder, or static-table ordering for selected shops, verify the result, and show a test QR. Use after menu categories and items already exist. If the source is still a PDF, image, spreadsheet, CSV, or pasted menu, use import-menu-from-document first.
metadata:
  author: X1
  version: "0.1.0"
---

# Publish an Existing Menu Online

Turn a confirmed X1 HQ catalog into the customer-facing online-ordering menu by
following the same business sequence as HQ: online categories, online menu
combination, shop/channel settings, publication, readback, then a test QR.
Customer-provided photos can be added after the relevant online item, category,
or shop target exists and before the final QR check.

## Boundary

- Use this skill only after the source item categories and sellable items exist
  in X1 HQ. A completed document import satisfies this condition.
- An item category is catalog structure. It is not automatically an online
  category and does not prove that its items are published online.
- For a source document that has not been imported, use
  `import-menu-from-document` first and complete its separate approval flow.
- Use only advertised X1 HQ MCP tools. Never call raw APIs or reconstruct a
  write through shell, browser automation, or direct HTTP.
- Read [references/capabilities.md](references/capabilities.md) when choosing
  tools or checking whether a step is supported by the connected gateway.
- Read [references/online-ordering-model.md](references/online-ordering-model.md)
  before planning the first publication in a conversation.

## Establish the target

1. Call `get_mcp_gateway_status`, then `bootstrap_hq_workspace` using every
   company, brand, or shop name the user supplied.
2. Resolve category and shop names through discovery; never ask for or invent
   numeric IDs when the tools can resolve them.
3. Confirm only choices that materially change the result:
   - target shop or shops;
   - ordering mode: counter, preorder, or static table;
   - payment mode: prepaid, pay later, or both;
   - mode-specific fulfilment choices;
   - source categories and online menu name.
4. If the user asks for a quick test and does not select a mode, recommend
   counter ordering when the shop already has its counter channel token.
   Static-table ordering is preferable only when the shop has enabled tables
   with existing static tokens. Do not silently choose a mode.

Use these fulfilment values:

- Counter: `dine_in`, `takeaway`, or both.
- Preorder: one or both of `pickup` and `delivery`, plus one or both of
  `order_now` and `preorder`.
- Static table: `dine_in`.

## Inspect before publication

1. Use `list_item_categories` to resolve the exact source category roots. Keep
   `includeDescendants` enabled unless the user explicitly excludes children.
2. Use `check_menu_publish_readiness` and
   `diagnose_online_ordering_menu_setup` for the selected shop scope.
3. Treat these as blockers when returned by the authoritative reads:
   incomplete shop identity or tokens, no enabled sellable leaf items, invalid
   category selection, missing mode prerequisites, or unresolved business
   choices.
4. Treat an empty parent category as valid structure when it has publishable
   descendants. Call out an empty leaf category because it contributes no
   sellable online items.
5. Modifier groups are independent channel-bearing records. Verify their Online
   Ordering visibility separately and generate a separate preview for any
   modifier change; do not assume catalog import visibility means online
   visibility.

## Preview and approval

Call `preview_publish_online_ordering_catalog` with the resolved brand, shops,
source category roots, online menu identity, mode, payment choice, and
fulfilment choices.

Show the returned `customerReview` in full. Also state:

- whether each source category will create or reuse a linked online category;
- distinct sellable item count;
- whether the online menu is created or updated;
- target shops and ordering mode;
- shop settings that change;
- warnings, blockers, and that separate commits are not atomic if other
  modifier/settings previews are also involved.

Do not request approval while `commitEligible` is false. Resolve the blockers
and create a fresh preview. Otherwise, ask for explicit approval of this exact
preview. Never treat the original request to publish as approval of the
generated preview.

## Commit and verify

1. After explicit approval of the complete preview, call
   `commit_publish_online_ordering_catalog` with the unchanged `previewId`, one
   stable `idempotencyKey`, and `approvalToken` set exactly to
   `user_explicitly_approved_final_preview`. This is a public approval attestation;
   the gateway exchanges it for a server-issued token internally. Never invent
   a token, ask the customer for one, or call an unadvertised approval action.
   The same handoff applies to `commit_update_online_ordering_settings`.
   Require the connected tool schema to advertise this handoff; an older gateway
   that rejects it needs the gateway update, not another commit path.
2. If asynchronous execution is accepted, poll `get_task_status` to a terminal
   state on the same gateway connection.
3. A `partially_committed` result is not success. Report completed and failed
   stages separately, stop dependent writes, and inspect current state before
   proposing recovery.
4. Read back with `check_menu_publish_readiness` and
   `diagnose_online_ordering_menu_setup`. Report `verified` only when the menu,
   selected shop, and ordering channel are ready.

## Add online menu photos

Treat photos as optional, separately approved changes. Publication must not be
blocked merely because a photo was not supplied.

Supported targets are:

- an item's dedicated Online Ordering image;
- online-category image slot 1, 2, or 3;
- a shop's Online Ordering logo, banner, or shop-list banner.

For each supplied JPG, JPEG, or PNG:

1. Resolve the exact existing item, online category, or shop target. For a
   just-created online category, use the committed `smartCategoryId`, not the
   source item-category ID.
2. Inspect the image and use the user's intended target when clear. Ask one
   concise mapping question only when multiple targets remain plausible.
3. Keep the exact bytes unchanged between preview and commit. Compute their
   byte length and SHA-256 digest, then call
   `preview_upload_online_ordering_image`. Item and shop images must be no more
   than 1,400,000 bytes; category images must be no more than 9 MiB.
4. Show the returned target, whether the action adds or replaces a photo, the
   file name, type, size, and current image reference. Obtain explicit approval
   for that exact preview. Several image previews may be shown in one numbered
   confirmation, but their commits remain independent and non-atomic.
5. Call `commit_upload_online_ordering_image` immediately with the exact
   approved Base64 bytes, a stable idempotency key, and `approvalToken` set to
   `user_explicitly_approved_final_preview` after the exact photo preview approval. Never request async
   execution, print Base64 in conversation, or place image bytes in notes or
   summaries. The gateway rechecks size, digest, file signature, approval,
   tenant, and target before upload and redacts binary input from audit data.
6. Treat only a returned `committed` or `already_committed` result as success.
   Confirm the returned image URL belongs to the intended target, then continue
   to the final QR so the customer can visually test the result.

Do not silently replace an existing photo, infer that a POS item image should
also be its online image, or reuse a category image slot different from the one
the user approved.

## Finish with a test QR

Call `get_online_ordering_test_qr` for each selected shop using the committed
mode.

- Counter and preorder each use their configured shop channel token.
- Static table uses an existing enabled table token. If the result is
  `needs_selection`, show the returned table names and ask one concise table
  question, then call the tool again with the selected `tableId`.
- Never regenerate table tokens as part of this workflow. Token regeneration is
  a separate destructive settings change requiring its own preview and
  approval.
- Dynamic/ad-hoc table QR codes are session-specific. Use counter or an
  existing static-table token for a stable customer test QR.
- When status is `ready`, render `qrCodeDataUrl` inline, label it with shop,
  mode, and table when applicable, and invite the user to scan it on a phone.
  Do not print the raw secret-bearing URL unless the user explicitly asks to
  inspect or copy it.
- When status is `not_ready`, list only the returned missing settings and the
  exact next action. Do not claim the menu publication failed when only QR
  prerequisites are incomplete.

End with a compact operation result: publication status, verified shop/mode,
QR status, warnings, and any independent follow-up work.
