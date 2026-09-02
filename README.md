# X1 Agent Plugins

This is the public marketplace for official X1 agent plugins.

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

For a reproducible installation, pin the marketplace to a published release
tag:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins --ref v0.3.5
```

## Available plugin

### X1 HQ

X1 HQ is the conversational operating and reporting surface for X1 merchants.
It helps an assistant resolve workspace and shop scope, inspect menus and device
settings, analyze reports, prepare previews, request genuine approvals, verify
outcomes, and return one consolidated operational report.

The current pilot is a controlled write-enabled staging rollout. The
gateway—not the skill text—is the authority for every capability.
Authentication, delegated scopes, user permissions, workspace scope, approval
requirements, audit rules, quotas, feature flags, and circuit breakers are all
enforced server-side.

See [`plugins/x1-hq`](plugins/x1-hq) for the workspace-native package, skills,
capability references, and evaluation cases. Portable Agent Plugins 1.0.0
clients should use the `x1-hq-agent-plugin` artifact attached to each GitHub
release; its manifests are maintained under [`portable/x1-hq`](portable/x1-hq).

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

The Git marketplace distributes the plugin manifest, skills, and app reference.
The referenced **X1 HQ Agent** app and gateway own the live MCP tool metadata.
Before publishing a release that changes tool names, schemas, annotations, or
OAuth scopes, X1 must deploy the gateway, refresh the app metadata, and validate
the connected OAuth client first. End users do not perform this developer
refresh.

Users normally do not need to reconnect their X1 HQ account for skill-only
updates. If a release requests additional OAuth scopes, X1 must first add those
scopes to the existing OAuth client allowlist. The user can then reconnect to
review and grant the new permissions. Publishing the Git plugin by itself does
not update an OAuth client's allowed scopes.

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
