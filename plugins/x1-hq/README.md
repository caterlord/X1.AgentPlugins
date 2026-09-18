# X1 HQ Agent Plugin

X1 HQ is a conversational operating and reporting plugin for X1 merchants. The
portable Agent Plugins 1.0.0 package combines shared skills with a direct
Streamable HTTP connection to the hosted X1 HQ MCP gateway. It has no registered
ChatGPT app dependency:

- `operate-x1-hq` handles everyday operational work across menus, settings,
  devices, online ordering, and other capabilities exposed by the gateway.
- `manage-tables-and-floorplans` handles dining tables and editable seating layouts.
- `publish-menu-online` handles online menus, photos and test QR verification.
- `analyze-x1-hq-reports` handles read-only reporting and investigation.
- `import-menu-from-document` handles resumable PDF, image, spreadsheet, CSV,
  and pasted-menu extraction, complete table review, explicit approval, and
  server-side approved commit handoff.

The skills are conversational operating guides. They contain no credentials,
do not call X1 HQ APIs directly, and grant no permission. The MCP gateway is the
only business-operation path and enforces authentication, workspace scope,
delegated scopes, previews and approvals, quotas, audit policy, and circuit
breakers.

Every new authenticated connection starts with `bootstrap_hq_workspace`, which
automatically persists a uniquely resolved company, brand, or shop path. When a
client exposes only part of the tool catalog, `find_hq_tools` and the scoped
read, preview, and commit dispatchers keep the remaining enabled capabilities
available without weakening their authorization or approval rules.

## Runtime availability

The plugin connects to the production X1 HQ gateway. Available
reads, previews, and commits still depend on the signed-in HQ user's delegated
scopes, workspace permissions, tenant scope, and the gateway's current rollout
gates. X1 may narrow or disable capabilities without requiring users to
reinstall this plugin.

## Compatibility

- Agent Plugins 1.0.0 clients with Streamable HTTP and MCP OAuth support.
- ChatGPT desktop and Codex through the repository marketplace. OpenAI currently
  marks imported plugins with MCP declarations as desktop-only, including remote
  HTTPS servers; this package does not provide ChatGPT web support.
- An X1 HQ user account with access to at least one workspace.

See [the installation guide](INSTALLATION.md) for platform-specific commands,
including Grok Build and Grok Bot.

## Capability availability

The capability references describe the package contract, but the
gateway remains authoritative. Operators can switch the gateway to read-only or
disabled mode, or disable individual tools or capability tags. Clients then see
only the allowed tools, and the gateway independently rejects stale or direct
execution attempts.

## Release policy

The plugin is versioned independently from the MCP gateway. Installing this
plugin does not expand an HQ user's permissions or bypass X1's runtime controls.

The marketplace installs this complete directory, including `plugin.json`,
`mcp.json`, and `skills/`. Generate the identical portable release package with
`node scripts/package-portable-agent-plugin.mjs`. Keep app references and native
wrappers out of this directory so all clients use the direct MCP connection.

## Version 0.8.1

Removes the development ChatGPT app dependency from marketplace installation.
Users authenticate directly with X1 through their client's MCP OAuth flow.

## Version 0.8.0

Adds promotion creation, editing, saved previews, requirement tracking and ordered
update/retirement plans with recovery. Includes dining tables and floorplans,
menu imports and maintenance, online publication and reporting. Start a new task
after updating to load the current skills and tool schemas.
