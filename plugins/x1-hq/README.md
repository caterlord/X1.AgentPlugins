# X1 HQ Agent Plugin

X1 HQ is a conversational operating and reporting plugin for X1 merchants. It
combines an OpenAI plugin wrapper, an Agent Plugins 1.0.0 portable package, two
Agent Skills, and the hosted X1 HQ MCP gateway:

- `operate-x1-hq` handles everyday operational work across menus, settings,
  devices, online ordering, and other capabilities exposed by the gateway.
- `analyze-x1-hq-reports` handles read-only reporting and investigation.

The skills are conversational operating guides. They contain no credentials,
do not call X1 HQ APIs directly, and grant no permission. The MCP gateway is the
only business-operation path and enforces authentication, workspace scope,
delegated scopes, previews and approvals, quotas, audit policy, and circuit
breakers.

## Current pilot status

The hosted gateway is currently in read-only pilot mode. Reporting and
inspection tools are available according to the signed-in HQ user's existing
permissions. Business-data writes are blocked at the gateway even if a client
has cached an older tool list. X1 may narrow, disable, or later enable
capabilities without requiring users to reinstall this plugin.

## Compatibility

- OpenAI Codex and ChatGPT desktop through the included `.codex-plugin` wrapper.
- Agent Plugins 1.0.0 clients through the portable `plugin.json` and `mcp.json`.
- An X1 HQ user account with access to at least one workspace.

See the repository-level README for installation instructions.

## Capability availability

The capability references describe the package contract, but the
gateway remains authoritative. Operators can switch the gateway to read-only or
disabled mode, or disable individual tools or capability tags. Clients then see
only the allowed tools, and the gateway independently rejects stale or direct
execution attempts.

## Release policy

The package is versioned independently from the MCP gateway. Installing this
plugin does not expand an HQ user's permissions or bypass X1's runtime controls.
