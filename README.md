# X1 Agent Plugins

This is the public marketplace for official X1 agent plugins.

## Install in ChatGPT desktop

Add `https://github.com/caterlord/X1.AgentPlugins` as a self-hosted marketplace
and install **X1 HQ**. The marketplace installs a portable package that connects
directly to `https://mcp.x1.tech/mcp`. Complete X1 sign-in through the client’s
MCP OAuth flow; no X1 development ChatGPT app is required.

OpenAI currently marks imported plugins that declare MCP servers as
[desktop-only](https://learn.chatgpt.com/docs/enterprise/plugin-management#desktop-only-plugins),
even when the server uses HTTPS. This package does not provide ChatGPT web support.

## Install in Codex

Add this GitHub repository as a marketplace:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins
```

Open the Plugins directory, choose **X1 Plugins**, and install **X1 HQ**. When
prompted, connect your X1 HQ account. Start a new Codex task after installation
so the task loads the installed plugin version and its current tools. The
plugin automatically uses a uniquely resolved workspace hierarchy and asks
only when more than one matching scope remains.

For a reproducible installation, add `--ref <published-release-tag>` to the
marketplace command. Releases through `v0.8.0` use the previous app-dependent
package; choose a published release containing the portable installation fix.

## Available plugin

### X1 HQ

X1 HQ is the conversational operating and reporting surface for X1 merchants.
It helps an assistant resolve workspace and shop scope, inspect menus and device
settings, analyze reports, prepare previews, request genuine approvals, verify
outcomes, and return one consolidated operational report.

The production gateway supports governed menu imports, menu maintenance, and
online ordering publication and photos. The gateway is the authority for every
capability.
Authentication, delegated scopes, user permissions, workspace scope, approval
requirements, audit rules, quotas, feature flags, and circuit breakers are all
enforced server-side.

See [`plugins/x1-hq`](plugins/x1-hq) for the complete Agent Plugins 1.0.0
package, shared skills, capability references, and evaluation cases. Both the
marketplace and portable release artifact use this directory.

## Keep the plugin up to date

This repository is an X1-operated public Git marketplace; it is not an OpenAI
marketplace listing. Codex does not expose a per-plugin **Refresh** button. To
pick up a release from the tracked Git branch, refresh the marketplace snapshot
and reinstall the plugin from that snapshot:

```sh
codex plugin marketplace upgrade x1-plugins
codex plugin add x1-hq@x1-plugins
```

Then start a new Codex task. Existing tasks keep the plugin skills and tool
schemas they loaded when the task began.

A marketplace added with `--ref` remains pinned to that Git ref. Moving a
pinned installation to another release is an explicit administrator or user
action; changing files on `main` does not move the pin.

The Git marketplace distributes the portable manifests and skills. The MCP
configuration points directly to the X1 gateway, which owns live tool metadata
and authentication. Client policies and OAuth consent still apply.

### Migrate an existing app-dependent installation

For version 0.8.1 or later, refresh the marketplace and reinstall
**X1 HQ**, then start a new task. Complete MCP OAuth sign-in if prompted; the
previous registered-app connection may not transfer to the direct MCP client.
For workspace-managed imports, ask the administrator to sync the marketplace.
Pinned installations must move to a release containing this fix.

If a connection dialog still names `asdk_app_…`, check that the installed package
is the updated version and that the marketplace is not pinned to `v0.8.0` or
older. The portable package contains no `.app.json` reference.

## Validate and package

Run `node scripts/package-portable-agent-plugin.mjs`. It checks that the
marketplace resolves to the complete portable package, rejects app-dependent
wrappers, verifies the MCP endpoint and skills, then copies the package to
`.artifacts/agent-plugin/x1-hq` and writes artifact checksums. Before publishing,
verify installation and OAuth sign-in in a fresh supported client session.

## Security and privacy

- Never paste passwords, access tokens, API keys, or authorization codes into a
  chat or issue.
- The plugin does not bundle X1 credentials.
- The assistant can access only data allowed by the signed-in X1 HQ account and
  selected workspace.
- To disconnect access, remove the X1 connection in your client and revoke it
  from your X1 account when available.

Please follow [SECURITY.md](SECURITY.md) when reporting a vulnerability.

## Source and licensing

This repository is public so users can inspect and install the plugin package.
No open-source license has been granted yet; unless a file states otherwise,
all rights are reserved by X1.
