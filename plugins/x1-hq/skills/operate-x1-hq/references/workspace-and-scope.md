# Workspace and scope

Workspace selection is mandatory authorization context. A selected company,
brand, or shop is a conversational default within that workspace, not a hard
authorization boundary. Explicit operation targets may differ from those
defaults only after the gateway refreshes the user's accessible HQ hierarchy;
HQ still authorizes every downstream request against the selected workspace.

## Selection procedure

1. List accessible workspaces.
2. Select the only option automatically, or match the user's named business.
3. If names are ambiguous, show the shortest useful disambiguation list.
4. Resolve company, brand, shop, menu, category, item, modifier, and device names
   with discovery tools. Never guess identifiers.
5. Keep the selected workspace stable through a multi-operation request unless
   the user explicitly asks to change it.
6. For a request spanning several brands or shops, keep one workspace selected,
   resolve and validate every explicit target, and retain the selected business
   scope only as the default for operations that omit an optional target.

When targets span shops, record the shop on each operation. Never broaden a
shop-specific request to the entire brand merely because a bulk tool permits it.

## Permission failures

A missing workspace, tenant, or delegated scope is a real authorization
boundary. Explain the boundary and the affected operation. Do not search for an
alternate tool that performs the same mutation under a weaker scope.
