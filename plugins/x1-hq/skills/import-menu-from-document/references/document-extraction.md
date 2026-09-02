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

## Bilingual names

Keep one operational `name` and preserve each printed language in
`localizedNames`. Do not concatenate two languages into one field when they can
be represented separately. Keep transliterations distinct from translations.

## Units, quantities, and variants

Model phrases such as per piece, per bowl, per portion, per four taels, one
piece, five pieces, small/large, half/whole, or regular/special as `salesUnit`,
`portionQuantity`, and `variantOptions`.

When several quantities have different prices, preserve every source variant.
Do not assume the discounted multi-piece price is a modifier surcharge or
multiply a single-piece price.

## Modifiers and combos

Use a modifier group only when the source establishes a selectable set and its
minimum/maximum selection count. If a combo title exists but the option list is
implicit or incomplete, preserve it as a `comboCandidate` with
`reviewStatus=needs_review` and ask the customer for the eligible choices.

Keep free substitutions, paid upgrades, exclusions, and schedules distinct.
Never compress them into a description if structured fields can preserve them.

## Channels and tax

Source wording is evidence, but tax treatment also depends on the resolved
target jurisdiction and existing HQ taxation context:

- printed dine-in implies only in-store intent;
- printed takeaway implies only takeaway intent;
- absence of delivery, online, or kiosk wording does not enable those channels;
- when every resolved target shop is definitively in Hong Kong and
  `get_menu_authoring_context` reports no active taxation, use
  `taxIntent=non_taxable`; Hong Kong has no sales tax, VAT, or GST, so do not
  ask whether menu prices include or exclude sales tax;
- do not infer Hong Kong solely from Chinese text, a brand name, or HKD. Use the
  resolved shop/company market or address, with locale and currency only as
  corroboration;
- if target shops span jurisdictions, the jurisdiction is unknown, or HQ has an
  active taxation configuration, use `taxIntent=needs_review` unless the source
  or established business settings resolve it.

Ask once at the draft level unless the source explicitly varies channel or tax
treatment by category or item.
