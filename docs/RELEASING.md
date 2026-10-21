# Plugin package releases

`plugins/x1-hq` is the production package source. Both the public Git marketplace
and portable release archive distribute that directory. Package versions are
independent of the hosted gateway version; this procedure publishes no gateway
binary and changes no service settings or database.

## Prepare and validate

1. Start from current `origin/main` in a clean checkout or isolated worktree.
2. Update `plugins/x1-hq/plugin.json`, its changelog and affected installation
   guidance. Production versions use `MAJOR.MINOR.PATCH`.
3. Generate packages with:

   ```sh
   node scripts/package-portable-agent-plugin.mjs
   node scripts/package-development-agent-plugin.mjs
   ```

   The development version defaults to the production candidate version plus
   `-dev.1` (for example production `0.8.9` and dev `0.8.9-dev.1`). It is a
   prerelease of the same package baseline. The development generator copies the
   entire production package and verifies every file except explicit identity,
   endpoint and connection-documentation overlays. `BASELINE.json` records the
   production source digests; the runtime tools still come from the selected
   hosted gateway.
4. Regenerate root `SHA256SUMS` from sorted ordinary files under `plugins/x1-hq`
   and verify it with `shasum -a 256 -c SHA256SUMS`.
5. Verify the intended endpoint, OAuth sign-in, tool discovery, gateway status
   and a workspace read in a fresh supported client connection. Use the normal
   user identity and keep verification read-only. Confirm calls use the intended
   direct server rather than a separate app connector.
6. Review the final diff, publish a pull request, and wait for required checks
   before merging it into `main`.

## Publish production

Publishing requires the user's deployment instruction. After merging, ensure
the release tag targets the verified `main` commit. For version `0.8.9`:

```sh
tar -czf .artifacts/x1-hq-0.8.9.tar.gz -C .artifacts/agent-plugin x1-hq SHA256SUMS
shasum -a 256 .artifacts/x1-hq-0.8.9.tar.gz
gh release create v0.8.9 .artifacts/x1-hq-0.8.9.tar.gz \
  --repo caterlord/X1.AgentPlugins --target VERIFIED_MAIN_COMMIT \
  --title 'X1 HQ 0.8.9 — Direct MCP connection recovery' \
  --notes-file RELEASE_NOTES_FILE
```

Inspect the published tag, asset digest and marketplace `main` commit. Refresh
the local marketplace and install the release to verify the distributed package:

```sh
codex plugin marketplace upgrade x1-plugins
codex plugin add x1-hq@x1-plugins
```

Start a fresh task to load the new skills and tools. Renew the MCP login when
OAuth metadata or credentials still refer to a previous domain. Follow the
README's explicit MCP registration recovery only when direct tools are missing.
This is a client recovery option, not a declaration that every client needs it.

## Install the local development package

Generate `.artifacts/agent-plugin-dev/x1-hq-dev` from the verified release source.
Replace the configured personal development package directory with that complete
generated tree after backing up the previous local package. Preserve its
`x1-hq-dev` identity and staging endpoint; then run:

```sh
codex plugin add x1-hq-dev@personal
```

The public marketplace continues to distribute only `x1-hq`. Do not publish the
development package as a production asset or change its endpoint to production.

## Rollback

Keep the previous tag and release assets. A client can pin the previous release
using `codex plugin marketplace add caterlord/X1.AgentPlugins --ref v0.8.8` in a
separate configured marketplace, then install from that source and start a new
task. To roll back the default tracked marketplace, publish a reviewed revert
on `main` with a new patch version. Do not rewrite an existing release tag or
replace its archive silently. Gateway rollback is a separate operation.
