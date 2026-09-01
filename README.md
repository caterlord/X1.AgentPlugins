# X1 Agent Plugins

This is the public marketplace for official X1 agent plugins.

## Install in Codex

Add this GitHub repository as a marketplace:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins
```

Restart Codex, open the Plugins directory, choose **X1 Plugins**, and install
**X1 HQ**. When prompted, connect your X1 HQ account and choose the workspace
you want the assistant to use.

For a reproducible installation, pin the marketplace to a published release
tag:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins --ref v0.1.0
```

## Available plugin

### X1 HQ

X1 HQ is the conversational operating and reporting surface for X1 merchants.
It helps an assistant resolve workspace and shop scope, inspect menus and device
settings, analyze reports, prepare previews, request genuine approvals, verify
outcomes, and return one consolidated operational report.

The first public pilot is read-only. The gateway—not the skill text—is the
authority for every capability. Authentication, user permissions, workspace
scope, approval requirements, audit rules, quotas, feature flags, and circuit
breakers are all enforced server-side.

See [`plugins/x1-hq`](plugins/x1-hq) for its portable manifests, skills,
capability references, and evaluation cases.

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
