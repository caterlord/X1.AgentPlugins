# Report routing

- Headline sales performance: brand sales summary.
- Daily movement or trend: sales trend summary.
- Two-period comparison: sales period comparison.
- Item or category drivers: item or category performance summary.
- Operational health: operations snapshot or operational exception summary.
- Bill and item audit: order details report.
- Tender and payment breakdown: payment details report.

For a quick sales total, use the brand sales summary. For a sales report,
sales details, or a shop breakdown, include the brand sales summary, category
performance, and item performance for the same resolved brand, shops, and dates.
Reuse a recent summary from the conversation when its scope matches. Include
payment details when the user requests a tender breakdown.

Show category sales and the leading items with amounts, quantities, and shares.
Label a limited ranking as top items/categories and preserve the full returned
total and count; do not imply that the displayed subset is the whole report.
If either detail report is empty or fails, identify the missing section explicitly
and still present available sections. An empty item report alongside nonzero
sales is a report gap, not evidence that no items sold.

Keep a narrower explicit request narrow (for example, payment methods only).
Do not call unrelated operational or order-audit reports by default.
