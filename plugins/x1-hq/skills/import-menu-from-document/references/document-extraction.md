# Document extraction guidance

## Visual reading

Render every PDF page or inspect every supplied image. Text extraction alone is
not sufficient for multi-column menus, price alignment, strikethroughs,
footnotes, bracketed size labels, or visual grouping.

For each record, preserve the smallest source span that supports it:

- PDF/image: page number, normalized `x/y/width/height`, text, and confidence;
- spreadsheet/CSV: sheet, 1-based row, column when useful, text, and confidence;
- pasted text: a stable source-local ID and exact supporting snippet.

Do not interpret decorations, page numbers, telephone numbers, minimum-spend
notices, or delivery fees as menu prices.

## Category and item codes

Treat printed category and item codes as source data and preserve them exactly
apart from surrounding whitespace. If the document does not print a code, omit
the optional draft field instead of creating a guessed code during extraction.

The import preview owns code generation because it can check the current HQ
brand and the full draft for collisions. It first creates a readable uppercase
category code, limited to a safe prefix length, and then generates each missing
new item code as `{CATEGORY_CODE}-{5 uppercase alphanumeric characters}`.
Standalone modifier options that will become HQ modifier items use the modifier
category as their prefix. Linked options reuse their linked item's code.

Always display the exact assigned codes returned in the preview tables. They
are frozen in that preview and are the codes that commit must use; do not
regenerate them after customer approval.

## Bilingual names

Keep one operational `name` and preserve each printed language in
`localizedNames`. Do not concatenate two languages into one field when they can
be represented separately. Keep transliterations distinct from translations.

## Units, quantities, and variants

Model phrases such as per piece, per bowl, per portion, per four taels, one
piece, five pieces, small/large, half/whole, or regular/special as `salesUnit`
and `portionQuantity`.

When several independently orderable quantities or sizes have different
prices, create a separate sellable item for each choice by default. Put the
distinguishing quantity or size in every operational and localized name, keep
one direct price on each item, and preserve the unit and quantity structurally.
For example, `Goose Feet 17/1 pc; 75/5 pcs` becomes `Goose Feet (1 pc)` at 17
and `Goose Feet (5 pcs)` at 75. Do not multiply the single-unit price or model
the multi-unit choice as a modifier surcharge.

Use `variantOptions` only when `get_menu_authoring_context` confirms that the
target can sell one parent item with selectable variants and the source or
customer intends that experience. A shared printed heading alone is not enough
to choose the variant-parent model.

## Modifiers and combos

Use a modifier group when the source establishes a selectable set and its
minimum/maximum selection count. A combo choice list may be explicit or
deterministically derivable from an item-code range, neighboring dishes, and
stated exclusions.

For a derived combo:

1. Resolve the exact eligible sibling items from the source boundary and apply
   all exclusions before naming options.
2. Convert each dish name into the component the customer is actually choosing.
   Remove serving-container words such as `rice`, `noodles`, `飯`, or `麵`, plus
   redundant brand words; keep cooking styles or other words needed to preserve
   meaning. For example, `咸雞飯` becomes `咸雞`, not a choice for the whole bowl
   of rice; `生記滷鵝飯`, `滷鴨飯`, and `咸雞飯` can therefore yield `滷鵝`,
   `滷鴨`, and `咸雞` in a rice-combo group.
3. Create standalone modifier options for those component labels. Do not use
   `linkedItemRef` merely because the source component was derived from another
   sellable dish: linking is appropriate only when selecting the complete
   existing product, including its own price and behavior. Do not inherit the
   sibling dish's full-item price into a component option unless the source
   explicitly states a surcharge.
4. Preserve the sibling-item and range evidence on the group and options. If the
   set is deterministic, do not also leave a blocking raw `comboCandidate` for
   the same rule.

If the candidate boundary, exclusion, or component meaning cannot be
reconstructed safely, preserve the rule as a `comboCandidate` with
`reviewStatus=needs_review` and ask one focused question.

For a mixed, assorted, or combination dish that explicitly lists its
components, create an item-specific omission modifier group by default unless
the source or target context says the recipe is fixed or non-customizable. Use
`selectionMode=multiple`, `required=false`, `minSelections=0`, and a maximum no
greater than the number of removable components. Each zero-price standalone
option is an action label such as `No liver` or `走粉肝`; omit `priceDelta` and
`linkedItemRef`, and map the group only to that composite dish. Exclude any
component the source or customer identifies as non-removable.

Keep free substitutions, paid upgrades, exclusions, and schedules distinct.
Never compress them into a description if structured fields can preserve them.

## Channels and tax

Source wording is evidence, but tax treatment also depends on the resolved
target jurisdiction and existing HQ taxation context:

- printed dine-in implies only in-store intent;
- printed takeaway implies only takeaway intent;
- absence of delivery, online, or kiosk wording does not enable those channels;
- when every resolved target shop is definitively in Hong Kong, use
  `taxIntent=non_taxable`; Hong Kong has no sales tax, VAT, or GST, so do not
  ask whether menu prices include or exclude sales tax unless HQ returns an
  explicit, active taxation setting that conflicts with that treatment;
- an unavailable or failed optional HQ taxation lookup is not evidence of an
  active tax. For a confirmed Hong Kong target it must not turn tax intent into
  `needs_review` or trigger a customer question;
- do not infer Hong Kong solely from Chinese text, a brand name, or HKD. Use the
  resolved shop/company market or address, with locale and currency only as
  corroboration;
- if target shops span jurisdictions, the jurisdiction is unknown, or HQ has an
  active taxation configuration, use `taxIntent=needs_review` unless the source
  or established business settings resolve it.

Ask once at the draft level unless the source explicitly varies channel or tax
treatment by category or item.
