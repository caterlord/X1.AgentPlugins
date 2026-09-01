# Settings, devices, and access

Current MCP capability, not the X1 HQ web UI, determines what can be automated.

## Active capability

- Inspect store and device settings through the available snapshot tools.
- Inspect online-ordering health and update supported online-ordering settings
  through their preview and commit pair.
- Rename an existing cash drawer through its preview and commit pair.

## Read-only or unavailable capability

- Store settings without an advertised preview and commit pair are inspection
  only.
- Printers and terminals can currently be inspected, but creating or configuring
  them is not an advertised mutation capability.
- POS user onboarding, role assignment, permission changes, and shop assignment
  are not currently advertised capabilities.

Staff access requests often contain names, email addresses, or phone numbers.
Do not ask for additional staff personal data when the operation is unsupported.
Minimize repetition of data the user already supplied, and never place staff
personal data into a workaround, raw API call, log-oriented output, or unrelated
operation summary.

For an unavailable operation, mark it `unsupported`, explain what inspection is
available, and continue supported independent work if the user wants. Never call
raw APIs or approximate a nearby setting.

When these domains are added later, require focused read, preview, and commit
contracts with dedicated scopes, audit coverage, idempotency, and readback. The
skill workflow does not need to change when the generated capability reference
adds those tools.
