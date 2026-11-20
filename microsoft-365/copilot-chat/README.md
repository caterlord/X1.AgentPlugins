# X1 HQ Pilot for Microsoft 365 Copilot Chat

This Microsoft 365 Agents Toolkit project provides workspace lookup and headline
sales reporting in Copilot Chat. The agent pins the staging gateway's
`get_mcp_gateway_status`, `bootstrap_hq_workspace`, and `get_brand_sales_summary`
tools. Workspace selection can save the user's connection context. Sales queries
use the signed-in X1 HQ user's authorization.

## Configure the pilot

1. Use a Microsoft 365 test tenant with Copilot access and custom app upload
   enabled. Open this folder in VS Code with Microsoft 365 Agents Toolkit.
2. Create or obtain a dedicated confidential Clerk OAuth application for the
   pilot. The staging MCP gateway uses the shared `https://clerk.posx1.ai`
   issuer. Enable the consent screen, assign only `settings.read` and
   `reports.read`, and register this callback exactly:

   ```text
   https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect
   ```

   In Clerk, select **Add URI** and then **Save**. Reload the application
   settings and verify the callback is listed under **Redirect URIs**.

3. Copy `env/oauth.env.example` to `env/.env.dev.user` and enter the OAuth client ID
   and secret locally. Git ignores that file. The Toolkit registers the OAuth
   configuration for the test tenant in Microsoft's token store during
   provisioning. The app package references the resulting registration ID.
4. Sign in through the Toolkit's **Accounts** section with the test tenant
   account, confirm Microsoft 365 Copilot access and custom app upload, then
   select **Lifecycle → Provision** for `dev`. The final step makes the agent
   available to its owner in Copilot Chat.

## Check the installed agent

1. In [Microsoft 365 Copilot Chat](https://m365.cloud.microsoft/chat), select
   **X1 HQ Pilot** in **Agents**, or open the personal pilot link from Toolkit's
   provision output. Complete X1 account consent when prompted.
2. Ask “Show the X1 HQ workspace I can access.” Check the effective scope
   against the test account's HQ permissions.
3. Ask “What were net sales and transaction count last week for [test shop]?”
   Compare the totals, date range, currency, and shop with HQ. Confirm that an
   out-of-scope shop cannot be queried.

The staging gateway shares the HQ API with production. Use an approved test
account and test workspace. Update the pinned definitions from the staging
gateway's `tools/list` response when the contracts change.

## Prepare the expanded projects

From the repository root, generate the Toolkit projects locally:

```sh
node scripts/package-copilot-chat-agent.mjs staging-full
node scripts/package-copilot-chat-agent.mjs production-full
node scripts/package-copilot-chat-agent.mjs production-read-only
```

The generator reads the selected gateway's public `tools/list` catalog. For an
offline build, pass the raw JSON-RPC `tools/list` response from that gateway as
the second argument. The generated projects are under `.artifacts/copilot-chat/`.
Regenerating a project preserves its local Toolkit identifiers and credentials.

**X1 HQ Staging** includes all five shared X1 skills and dynamically discovers
the full staging MCP tool catalog. The Copilot version of the import skill
moves the original language and draft construction instructions into a required
reference to meet Microsoft's size limit.

**X1 HQ** uses the production MCP endpoint and dynamically discovers the same
tool catalog as the native `x1-hq` plugin. Copilot validates tools at runtime.
The expanded projects submit every authorized report as a background task. They require a gateway catalog that advertises `reportRequestId` and `reportOffset`. Keep the returned task ID to retrieve progress or results in a later turn.
For other work the agent prefers direct tools and can use the gateway's read, preview, and
commit dispatchers when a tool is unavailable directly. Each operations project
requires a separate Clerk client and Microsoft OAuth registration with the full
delegated scope set, including write scopes and `booking.read`.

**X1 HQ Reporting** is the read-only production option. It uses the shared
reporting skill and `settings.read` and `reports.read`. Each generated project
has personal Copilot distribution for the first validation run.

Start Agents Toolkit with `TEAMSFX_AGENT_SKILLS=true` before provisioning an
expanded project. Copy its `env/oauth.env.example` to `env/.env.dev.user`, add
that project's OAuth client values locally, and provision the project from its
generated folder. Confirm the built ZIP contains `skills/` and that each
`agent_skills` entry resolves to the expected `SKILL.md`.

Validate scope selection and reports, the menu-import draft and resume flow,
floorplan input, and online ordering readiness in the staging agent. In an
approved isolated test workspace, verify the approval, decline, changed-preview,
and readback paths. Test document and image handling in Copilot Chat before
enabling attachment-dependent operations. Verify the production reporting
candidate separately using a read-only HQ test identity.
