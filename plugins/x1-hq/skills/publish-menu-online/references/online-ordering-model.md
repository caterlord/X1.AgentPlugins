# X1 HQ online-ordering model

## Catalog versus online presentation

Document import and ordinary menu authoring create persistent item categories,
items, prices, and modifier relationships. Online ordering has a separate
presentation and publication layer:

1. **Item category** — source catalog hierarchy.
2. **Online smart category** — customer-facing category linked back to an item
   category by `onlineStoreRefCategoryId`; it carries Online Ordering display,
   shop schedule, and ordering-channel settings.
3. **Online menu combination** — ordered online categories assigned to shops,
   enabled, and published.
4. **Shop online-ordering settings** — website identity, shop identity, secret,
   order availability, payment rules, fulfilment rules, and per-mode channel
   tokens.
5. **Test QR** — an encoded online-shop URL for a configured service mode.

The publishing tool creates or reuses the online smart-category layer. Reuse is
based on the persisted source-category link, not only a same-looking name.

## Service modes

| User-facing mode | Tool value | HQ service | Channel |
| --- | --- | --- | ---: |
| Counter / quick order | `counter` | `counter` | 5 |
| Preorder | `preorder` | `preorder` | 6 |
| Static table order | `table_static` | `dineinstatic` | 1 |

Counter is the simplest general test mode when its shop token exists. Static
table mode additionally needs one enabled table carrying an existing static
token. A static table QR identifies that table; a counter QR does not.

## Parent and empty categories

A non-terminal parent category may contain no direct items and still be useful
because its child categories contain the sellable items. An empty terminal
category contributes nothing to the online menu and should be surfaced for
review instead of silently presented as populated.

## Safe update behavior

- Existing online menu categories and shops outside the requested additions are
  preserved.
- Existing online-category schedules and unrelated channels are preserved.
- Selected shops receive the requested channel and mode settings.
- Publication is high risk because it changes customer-visible ordering and
  shop acceptance behavior, so preview and explicit approval are mandatory.
- The QR URL contains operational secrets. Render the QR by default; disclose
  the raw URL only on explicit request.
