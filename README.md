# X1 Agent Plugins

Official vendor-neutral X1 agent plugins for operating and reporting on X1 HQ.
The complete package uses Agent Plugins 1.0.0, shared Agent Skills, and a direct
MCP connection to X1. It is not exclusive to any AI provider. Installation
depends on which package formats and connection methods your client supports.

## Connect from your AI client

| Client capability | Installation path | What is loaded |
| --- | --- | --- |
| Agent Plugins 1.0.0 package loading | Load [`plugins/x1-hq`](plugins/x1-hq), or the portable artifact from a published release | Plugin metadata, shared skills, and MCP configuration |
| Compatible Git marketplace import | Add this repository and select **X1 HQ** | The same complete package, subject to the client's importer support |
| Remote MCP with Streamable HTTP and OAuth | Add `https://mcp.x1.tech/mcp` as an MCP connection and complete X1 sign-in | Live gateway tools; bundled skills are not automatically installed |

For a full plugin installation, the client must load the package's `plugin.json`,
`mcp.json`, and `skills/`. A successful MCP connection alone does not demonstrate
that the client loaded the plugin's workflow instructions. If your client also
supports Agent Skills separately, use the skills from this same package through
its documented skill-loading mechanism.

For Grok Bot, see the [installation routes below](#grok-bot). A marketplace
import limitation does not mean X1 is Codex/ChatGPT-only. Clients that support
only remote MCP can connect to the endpoint above, but should describe that as
an **X1 HQ MCP connection** unless the shared skills also loaded.

## Client-specific installation examples

These instructions use the same Agent Plugins 1.0.0 package across clients.
Platform documentation was checked on 2026-09-18; this is installation guidance,
not a claim that X1 has completed live OAuth and workflow certification in every
client. Use a current client version with Agent Plugins support enabled.

- [VS Code / GitHub Copilot](#vs-code--github-copilot)
- [GitHub Copilot CLI](#github-copilot-cli)
- [Cursor](#cursor)
- [Kiro](#kiro)
- [Grok Build CLI](#grok-build-cli)
- [Grok Bot](#grok-bot)
- [ChatGPT desktop](#chatgpt-desktop)
- [Codex](#codex)

For the local-folder methods below, first clone the repository:

```sh
git clone https://github.com/caterlord/X1.AgentPlugins.git
```

The package directory is `X1.AgentPlugins/plugins/x1-hq`, containing
`plugin.json`, `mcp.json`, and `skills/`. Select this directory when a client
asks for a plugin folder. Alternatively, extract a published portable release
artifact and select the directory containing those same files.

### VS Code / GitHub Copilot

1. Clone the repository as shown above.
2. Open **Preferences: Open User Settings (JSON)** from the Command Palette.
3. Merge these settings, replacing the example path with the absolute path to
   your cloned plugin directory:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/absolute/path/X1.AgentPlugins/plugins/x1-hq": true
  }
}
```

4. Run **Chat: Open Customizations**, then open **Plugins** and verify X1 HQ
   is enabled. Complete X1 MCP sign-in when prompted.

VS Code also discovers plugins installed through Copilot CLI, so the CLI method
below is another installation route. See [VS Code's plugin documentation](https://code.visualstudio.com/docs/agent-customization/agent-plugins).

### GitHub Copilot CLI

Install the package directly from its GitHub subdirectory:

```sh
copilot plugin install caterlord/X1.AgentPlugins:plugins/x1-hq
copilot plugin list
```

Start a new interactive session, check `/skills list`, and complete X1 MCP
OAuth sign-in when prompted. For a local checkout instead, run
`copilot plugin install ./X1.AgentPlugins/plugins/x1-hq` from the directory
containing the clone. See [Copilot CLI's plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference).

### Cursor

Use Cursor's documented local-plugin loading path for this package:

1. Clone the repository as shown above.
2. Copy the complete `plugins/x1-hq` directory from the clone to
   `~/.cursor/plugins/local/x1-hq`. The resulting manifest must be at
   `~/.cursor/plugins/local/x1-hq/plugin.json`.
3. Run **Developer: Reload Window**, or restart Cursor.
4. Open **Customize** and verify the X1 HQ skills and MCP server appear, then
   complete X1 sign-in.

Local plugin imports must be allowed by your organization's settings. If a
marketplace version of X1 HQ is already installed, Cursor gives that installation
precedence over the local copy. This local method does not require an X1 listing
in Cursor's public marketplace. See [Cursor's plugin documentation](https://prod.cursor.com/docs/plugins#test-plugins-locally).

### Kiro

Kiro installs Agent Plugins as powers:

1. Clone the repository as shown above.
2. Open **Powers** → **Add Custom Power**.
3. Choose **Import power from a folder**.
4. Select `X1.AgentPlugins/plugins/x1-hq` and click **Install**.
5. Verify the power is installed and complete X1 MCP sign-in when prompted.

Use the package folder rather than the marketplace root. See
[Kiro's power installation documentation](https://kiro.dev/docs/powers/installation/).

### Grok Build CLI

Grok Build supports direct GitHub subdirectory installation. After reviewing
the X1 package, install it with:

```sh
grok plugin install 'caterlord/X1.AgentPlugins#plugins/x1-hq' --trust
grok plugin details x1-hq
```

For a local clone instead:

```sh
grok plugin validate ./X1.AgentPlugins/plugins/x1-hq
grok plugin install ./X1.AgentPlugins/plugins/x1-hq --trust
```

Start a new Grok Build session, then check `/skills` and `/mcps`. Confirm the
X1 skills and the connection to `https://mcp.x1.tech/mcp` are present, complete
OAuth, and request a read-only workspace lookup. `--trust` enables the plugin's
components; omitting it displays the source for review without completing the
installation. Update an installed package with `grok plugin update x1-hq`.

On 2026-09-18, the locally installed Grok CLI accepted X1 HQ 0.8.1 with
`grok plugin validate` and reported its skills directory. This validates
manifest parsing and skill-directory discovery only. Grok's published guide
documents `.mcp.json`, while X1's standard package uses `mcp.json`; MCP discovery
and OAuth must still be checked before claiming full compatibility. Installing
in Grok Build does not establish installation in the separate Grok Bot app.

Sources: [Grok Build plugin guide](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/09-plugins.md)
and [official skills and plugins documentation](https://docs.x.ai/build/features/skills-plugins-marketplaces).

### Grok Bot

Grok Bot has plugin and saved-skill installation paths. Grok Bot and Grok Build
CLI are different clients; `grok plugin install` instructions for the CLI do not
establish how to install in the desktop Bot app.

**Catalog installation:** Open **Plugins** (or **Marketplace** in versions using
that sidebar label), search for the service, add it, complete browser
authorization, and confirm it appears under **Installed**. Follow this route
for X1 HQ only if it is listed in your available catalog; this repository does
not claim an approved public Grok Bot listing. See the
[official Grok Bot connection guide](https://prod.cursor.com/help/grok-bot/connect-plugins).

**Repository import through a Cursor team marketplace:** The
[OrgX plugin author's installation guide](https://github.com/useorgx/orgx-grokbot-plugin)
documents **Cursor Dashboard → Plugins → Import from Repo** for Grok Bot.
Where that option is available to your team, import
`https://github.com/caterlord/X1.AgentPlugins`, select **X1 HQ** if discovered,
then install and authenticate from Grok Bot. X1's package is under
`plugins/x1-hq`. This route is reported by another plugin author whose package
uses Cursor-specific manifests; acceptance of X1's Agent Plugins 1.0.0 package
by that importer still needs live verification. If import fails, record the
error rather than claiming the package installed.

**Connection plus saved workflows:** If repository import is unavailable, ask
Grok Bot to connect the MCP server and save the shared workflows as skills. A
suggested setup prompt is:

> Set up X1 HQ from https://github.com/caterlord/X1.AgentPlugins. The complete
> Agent Plugins package is in plugins/x1-hq. Try your supported full-plugin
> installation route first. If that is unavailable, connect
> https://mcp.x1.tech/mcp?auth=required through MCP OAuth, read the five SKILL.md files and
> their referenced resources under plugins/x1-hq/skills, and save those workflows
> using your supported skill mechanism. Preserve their approval and workspace
> rules. Report which skills and connection actually loaded, and any resources
> you could not retain. Verify with a read-only workspace lookup.

The official [Grok Bot workflow guide](https://prod.cursor.com/docs/grok-bot/work)
documents asking a Bot to save a skill, selecting it with `/`, and enabling
missing private skills under **Settings → Plugins → Yours**. Check the saved
X1 workflows there. This is a guided adaptation using Grok's saved skills, not
proof of native package import or automatic preservation of referenced files.
**OAuth connection recovery:** Use `https://mcp.x1.tech/mcp?auth=required`
for Grok Bot. This asks X1 to challenge during connection so Grok can discover
and start OAuth. If an existing connection reports `no_auth_link`, update that
connection to this URL, then open **Your plugins → X1 HQ → Authenticate**.
Complete browser sign-in and verify the connection with `get_mcp_gateway_status`.
An **Added** card alone does not verify authentication. Do not add static tokens.

On 2026-09-18, the equivalent staging connection completed browser OAuth,
discovered 87 tools, and successfully called `get_mcp_gateway_status` in Grok Bot.
The same gateway fix is deployed to production. Full package import and business
workflow certification remain separate checks. Other clients can retain the
default `/mcp` URL; both routes use the same account authorization and scopes.

### ChatGPT desktop

Add `https://github.com/caterlord/X1.AgentPlugins` as a self-hosted marketplace
and install **X1 HQ**. The marketplace installs a portable package that connects
directly to `https://mcp.x1.tech/mcp`. Complete X1 sign-in through the client’s
MCP OAuth flow; no X1 development ChatGPT app is required.

OpenAI currently marks imported plugins that declare MCP servers as
[desktop-only](https://learn.chatgpt.com/docs/enterprise/plugin-management#desktop-only-plugins),
even when the server uses HTTPS. This package does not provide ChatGPT web support.

### Codex

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

### Verify the complete installation

In a new session, confirm the client loaded X1 HQ's skills (for example,
`operate-x1-hq` and `analyze-x1-hq-reports`) and the `x1-hq` MCP connection.
Complete browser sign-in, then ask: **“Show the X1 HQ workspace I can access.”**
The assistant should use `bootstrap_hq_workspace` to resolve your authorized
scope. If tools are available but the skills are absent, revisit the plugin
installation; adding the MCP URL alone loads only the connection.

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

For portable installations, load the updated package through your client's
documented update mechanism. For direct MCP connections, the gateway supplies
the current tool catalog; reconnect or refresh tools as your client requires.
Separately loaded skills must also be updated when their package changes.

### Codex marketplace updates

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
