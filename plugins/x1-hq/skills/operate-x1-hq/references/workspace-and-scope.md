# Workspace and scope

Workspace selection is mandatory authorization context. A selected company,
brand, or shop is a conversational default within that workspace, not a hard
authorization boundary. Explicit operation targets may differ from those
defaults only after the gateway refreshes the user's accessible HQ hierarchy;
HQ still authorizes every downstream request against the selected workspace.

## Selection procedure

1. List accessible workspaces on a new authenticated connection and retain the
   returned workspace/company/brand/shop hierarchy as verified conversational
   context for that connection.
2. Determine the deepest scope level required by the request. A category or
   menu question usually requires a brand; a device or store-settings question
   usually requires a shop.
3. Filter complete hierarchy paths using, in order: the user's explicit target
   names, the current persisted selection, and previously verified references
   from the same authenticated conversation.
4. Collapse every level with exactly one remaining option. Select the workspace
   automatically with `commit_set_hq_workspace`; when supported, persist the
   uniquely resolved company, brand, and shop defaults too.
5. If several workspaces exist but a named company, brand, or shop maps to one
   workspace only, that is a unique path. Select it without asking which
   workspace the user wants.
6. Ask one concise question only at the first required level with multiple
   remaining candidates. Show the shortest useful disambiguation list, including
   parent names only where they distinguish otherwise identical names.
7. Do not ask the user to confirm a workspace, company, brand, or shop that has
   only one candidate. For example, one workspace plus one company requires no
   workspace/company question for a brand operation; a single complete
   workspace/company/brand/shop path requires no scope question for a shop
   operation.
8. Resolve company, brand, shop, menu, category, item, modifier, and device names
   with discovery tools. Never guess identifiers.
9. Keep the selected workspace stable when the user omits a target. If an
   explicit target uniquely resolves to another workspace, change context,
   invalidate previews from the former workspace, and re-read before previewing
   any business mutation.
10. For a request spanning several brands or shops, resolve and validate every
    explicit target and retain the selected business scope only as the default
    for operations that omit an optional target.

## Context freshness

- Reuse a hierarchy or name-to-ID mapping returned earlier in the same active
  authenticated connection. Do not make the user repeat a scope the agent has
  already resolved.
- Do not silently restore mappings from before reconnect, revocation, permission
  changes, or a gateway workspace-reselection error. Refresh the hierarchy, then
  apply the same unique-path rules automatically.
- A persisted workspace or business selection is a default, not proof that an
  explicitly named target belongs there. Validate explicit targets against the
  current accessible hierarchy.

When targets span shops, record the shop on each operation. Never broaden a
shop-specific request to the entire brand merely because a bulk tool permits it.

## Permission failures

A missing workspace, tenant, or delegated scope is a real authorization
boundary. Explain the boundary and the affected operation. Do not search for an
alternate tool that performs the same mutation under a weaker scope.
