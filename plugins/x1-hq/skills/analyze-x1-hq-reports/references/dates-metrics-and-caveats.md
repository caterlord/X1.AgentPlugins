# Dates, metrics, and caveats

## Dates

Translate relative language such as "last week" or "yesterday" into exact dates
using the user's timezone. State the inclusive date range used.

Pass the selected inclusive dates to the report tools, including the same date
for a one-day report. Do not advance the end date in the assistant: the HQ API
handles stored-procedure date boundaries. Do not describe a report as covering
calendar-day transaction timestamps unless its source confirms that basis;
item performance is grouped by the opening date of the shop workday.

## Metrics

Use normalized returned metrics and currency. Do not combine differently scoped
shops, brands, channels, or periods without saying how they differ.

Keep item/category amounts, headline gross/net sales, and tender collections
labelled separately. Do not claim that they must reconcile or invent a reason
for a difference. Preserve void inclusion filters on payment reports; exclude
voided payments for an ordinary breakdown unless the user asks to include them.

## Caveats

Surface empty results, missing comparison periods, partial discovery, exclusions,
truncation, and source limitations before making a recommendation. If a tool
returns caveats, preserve their meaning rather than smoothing them away.

Facts come from tool output. Inferences must be labelled and tied to those facts.
