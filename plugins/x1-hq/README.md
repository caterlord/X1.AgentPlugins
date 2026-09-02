# X1 HQ Agent Plugin

This directory is the portable X1 HQ Copilot package. It follows Agent Plugins
1.0.0 and combines three Agent Skills with the hosted X1 HQ MCP gateway:

- `operate-x1-hq` handles everyday operational work across menus, settings,
  devices, online ordering, and other capabilities exposed by the gateway.
- `analyze-x1-hq-reports` handles read-only reporting and investigation.
- `import-menu-from-document` handles resumable PDF, image, spreadsheet, CSV,
  and pasted-menu extraction through a non-mutating import preview.

The skills are the conversational operating guide. They do not contain
credentials, call X1 HQ APIs directly, or grant permissions. The MCP gateway is
the only business-operation path and continues to enforce authentication,
tenant scope, delegated scopes, preview and approval requirements, quotas, and
audit policy.

## Validate

From the `X1.HQ.Agent` repository root:

```sh
pnpm generate:agent-plugin
pnpm validate:agent-plugin
pnpm test:agent-plugin-conformance
pnpm package:agent-plugin
```

`generate:agent-plugin` refreshes the capability references from the canonical
tool contracts. `validate:agent-plugin` checks the vendored Agent Plugins JSON
schemas, Agent Skills structure, semantic URL and containment rules, references,
secret safety, and generated-contract drift.

`test:agent-plugin-conformance` validates isolated package copies, including
standards-compliant YAML, fixed component discovery, legal contained paths, and
both accepted and rejected MCP configurations. It also proves that malformed
manifests, unsafe paths or credentials, stale generated catalogs, and invalid
workflow/tool routing fail the release gate.

`package:agent-plugin` produces `.artifacts/agent-plugin/x1-hq/` from the
validated source package and writes a SHA-256 inventory beside it. This `0.1.x`
line is intended for controlled pilot distribution while hosted OAuth and live
client certification are completed.

Repository CI also runs `pnpm test:vendor-discovery`, which proves that clients
must use the exact `/mcp` protected-resource document and discover the Clerk
authorization server from its `authorization_servers` value. A legacy generic
resource document is deliberately rejected.

## Capability availability

The generated capability references describe the release contract, but the
gateway remains authoritative. Operators can switch the gateway to read-only or
disabled mode, or disable individual tools or capability tags. Clients then see
only the allowed tools, and the gateway independently rejects stale or direct
execution attempts.

## Release policy

The portable package is versioned independently from the MCP gateway. A release
must validate the packaged directory and then pass the repository's MCP,
authorization, tenant-isolation, approval, idempotency, and client-specific
conformance gates. Vendor adapters remain outside this portable core.
