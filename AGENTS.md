# Agent plugin maintenance

This repository owns the public X1 HQ plugin package and Git marketplace.
The runtime gateway is released separately; a package release does not authorize
server configuration, database changes, or business writes.

- Preserve unrelated local changes and prepare releases from current `origin/main`.
- Keep production identity `x1-hq` and its `https://mcp.posx1.ai/mcp` endpoint.
- Bind skill calls to the packaged direct MCP server. A separately registered app
  connector must not substitute for that connection.
- Generate development packages from the current production package with
  `scripts/package-development-agent-plugin.mjs`; retain `x1-hq-dev` and staging.
  Do not continue an independently copied, older skill tree.
- Follow [docs/RELEASING.md](docs/RELEASING.md) for checks, publication and rollback.
- Never publish credentials, customer data, workspace identifiers or private logs.
