# X1 Agent Plugins

This is the public marketplace for official X1 agent plugins.

## Install in Codex

Add this GitHub repository as a marketplace:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins
```

Restart Codex, open the Plugins directory, choose **X1 Plugins**, and install
**X1 HQ**. When prompted, connect your X1 HQ account. The plugin automatically
uses a uniquely resolved workspace hierarchy and asks only when more than one
matching scope remains.

For a reproducible installation, pin the marketplace to a published release
tag:

```sh
codex plugin marketplace add caterlord/X1.AgentPlugins --ref v0.1.3
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

See [`plugins/x1-hq`](plugins/x1-hq) for the workspace-native package, skills,
capability references, and evaluation cases. Portable Agent Plugins 1.0.0
clients should use the `x1-hq-agent-plugin` artifact attached to each GitHub
release; its manifests are maintained under [`portable/x1-hq`](portable/x1-hq).

## Import into a ChatGPT workspace

Workspace admins can import this repository as an in-house marketplace:

1. Open **Admin > Plugins** and select **Add > Import marketplace**.
2. Use `https://github.com/caterlord/X1.AgentPlugins` as **Source**.
3. Leave **Path** empty because the marketplace manifest is at the repository
   root.
4. Select an immutable release tag for a controlled rollout, or `main` for
   automatic updates after reviewed merges.
5. Enable the required **X1 HQ Agent** app for the same roles that can install
   the **X1 HQ** plugin.

Importing the marketplace does not grant X1 access. Each member still signs in
to X1 HQ, and the gateway continues to enforce tenant scope and runtime policy.

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
