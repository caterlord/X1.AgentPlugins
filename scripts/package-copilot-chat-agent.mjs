import assert from "node:assert/strict";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const pilot = path.join(root, "microsoft-365/copilot-chat");
const portable = path.join(root, "plugins/x1-hq");
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

const readTools = [
  "get_mcp_gateway_status", "bootstrap_hq_workspace", "get_brand_sales_summary",
  "find_hq_tools", "call_hq_read_tool"
];
const readScopes = ["settings.read", "reports.read"];
const stagingEndpoint = "https://x1hq-mcp-staging.azurewebsites.net/mcp";
const productionEndpoint = (await readJson(path.join(portable, "mcp.json"))).mcpServers["x1-hq"].url;
const operations = {
  scopes: [
    ...readScopes, "booking.read", "store_settings.read",
    "menu.read", "menu.preview", "menu.write",
    "online_ordering.read", "online_ordering.preview", "online_ordering.write",
    "table_settings.read", "table_settings.preview", "table_settings.write",
    "device_settings.read", "device_settings.preview", "device_settings.write"
  ],
  skills: [
    "analyze-x1-hq-reports", "operate-x1-hq", "import-menu-from-document",
    "manage-tables-and-floorplans", "publish-menu-online"
  ],
  version: "1.1.0",
  instructions: "operations-instructions.txt",
  codeInterpreter: true
};
const profiles = {
  "staging-full": {
    ...operations,
    name: "X1 HQ Staging",
    description: "Operate and analyze authorized X1 HQ workspaces against the staging gateway.",
    endpoint: stagingEndpoint,
    workspace: "authorized X1 HQ test workspaces"
  },
  "production-full": {
    ...operations,
    name: "X1 HQ",
    description: "Run reports and manage menus, online ordering, tables, and settings in X1 HQ.",
    endpoint: productionEndpoint,
    workspace: "authorized production X1 HQ workspaces"
  },
  "production-read-only": {
    name: "X1 HQ Reporting",
    version: "1.1.0",
    description: "Analyze authorized X1 HQ reports and sales performance in Copilot Chat.",
    endpoint: productionEndpoint,
    tools: readTools,
    scopes: readScopes,
    skills: ["analyze-x1-hq-reports"],
    instructions: "reporting-instructions.txt"
  }
};

const [target, catalogFile, extra] = process.argv.slice(2);
assert.ok(Object.hasOwn(profiles, target) && !extra,
  "Usage: node scripts/package-copilot-chat-agent.mjs staging-full|production-full|production-read-only [tools-list.json]");
const profile = profiles[target];

async function fetchCatalog() {
  const response = await fetch(profile.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    signal: AbortSignal.timeout(15000)
  });
  assert.ok(response.ok, `MCP discovery failed with HTTP ${response.status} at ${profile.endpoint}.`);
  return response.text();
}

const catalogText = catalogFile ? await readFile(catalogFile, "utf8") : await fetchCatalog();
const payloads = catalogText.trimStart().startsWith("{") ? [catalogText]
  : catalogText.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5));
const catalog = payloads.map((payload) => JSON.parse(payload)).find((payload) => Array.isArray(payload.result?.tools))?.result;
assert.ok(catalog?.tools.length, `Expected an MCP tools/list result for ${profile.endpoint}.`);
assert.ok(!catalog.nextCursor, "Expected the gateway to return its complete tool catalog in one response.");
const byName = new Map(catalog.tools.map((tool) => [tool.name, tool]));
assert.equal(byName.size, catalog.tools.length, "The gateway returned duplicate tool names.");
assert.ok(byName.get("call_hq_read_tool")?.inputSchema?.properties?.reportRequestId
  && byName.get("get_task_status")?.inputSchema?.properties?.reportOffset,
  "This Copilot package requires a gateway catalog with background report submission and result paging.");
const toolScopes = (tool) => (tool.securitySchemes ?? []).flatMap((scheme) => scheme.scopes ?? []);
const catalogScopes = new Set(catalog.tools.flatMap(toolScopes));
for (const scope of profile.scopes) {
  assert.ok(catalogScopes.has(scope), `The gateway catalog does not advertise ${scope}.`);
}
const selectedTools = profile.tools ? profile.tools.map((name) => {
  assert.ok(byName.has(name), `The gateway does not advertise ${name}.`);
  return byName.get(name);
}) : catalog.tools;
for (const tool of selectedTools) {
  const { name, description, inputSchema, annotations } = tool;
  assert.ok(name && description && inputSchema?.type === "object"
    && typeof annotations?.readOnlyHint === "boolean"
    && typeof annotations?.destructiveHint === "boolean", `Missing the complete tool definition for ${name}.`);
  const requiredScopes = toolScopes(tool);
  assert.ok(requiredScopes.length && requiredScopes.every((scope) => profile.scopes.includes(scope)),
    `${name} lacks valid delegated scope metadata for ${target}.`);
  if (profile.tools) {
    const selectsWorkspace = name === "bootstrap_hq_workspace";
    assert.equal(annotations.readOnlyHint, !selectsWorkspace, `${name} changed its read-only hint.`);
    assert.equal(annotations.destructiveHint, selectsWorkspace, `${name} changed its destructive hint.`);
  }
}

const output = path.join(root, ".artifacts/copilot-chat", target);
const app = path.join(output, "appPackage");
const pilotApp = path.join(pilot, "appPackage");
const [manifest, agent, plugin, lifecycle, instructions] = await Promise.all([
  readJson(path.join(pilotApp, "manifest.json")),
  readJson(path.join(pilotApp, "declarativeAgent.json")),
  readJson(path.join(pilotApp, "ai-plugin.json")),
  readFile(path.join(pilot, "m365agents.yml"), "utf8"),
  readFile(path.join(pilot, "workflows", profile.instructions), "utf8")
]);
manifest.version = profile.version ?? manifest.version;
manifest.name = { short: profile.name, full: `${profile.name} for Microsoft 365 Copilot Chat` };
manifest.description = { short: profile.description, full: profile.description };
manifest.validDomains = [new URL(profile.endpoint).hostname];
manifest.copilotAgents.declarativeAgents[0].id = "x1HQ";

agent.$schema = "https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.9/schema.json";
agent.version = "v1.9";
agent.name = profile.name;
agent.description = profile.description;
agent.actions[0].id = "x1HQActions";
agent.agent_skills = profile.skills.map((name) => ({ folder: `skills/${name}` }));
if (profile.codeInterpreter) {
  agent.capabilities = [{ name: "CodeInterpreter" }];
  agent.conversation_starters.push(
    { title: "Review a menu change", text: "Help me preview an X1 HQ menu change." },
    { title: "Draft a menu import", text: "Help me prepare an X1 HQ draft from a menu I attach." },
    { title: "Inspect online ordering", text: "Check online ordering readiness for my shop." }
  );
}

plugin.name_for_human = profile.name;
plugin.description_for_human = profile.description;
plugin.namespace = "X1HQActions";
const [runtime] = plugin.runtimes;
runtime.spec = { url: profile.endpoint };
runtime.run_for_functions = ["*"];
plugin.functions = [];
if (profile.tools) {
  runtime.spec.mcp_tool_description = {
    tools: selectedTools.map(({ name, description, inputSchema, annotations }) =>
      ({ name, description, inputSchema, annotations }))
  };
  runtime.run_for_functions = profile.tools;
  plugin.functions = selectedTools.map(({ name, description }) => ({ name, description }));
}

const lifecyclePath = path.join(output, "m365agents.yml");
const prior = await readFile(lifecyclePath, "utf8").catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return "";
});
const projectId = prior.match(/^projectId: [\w-]+$/m)?.[0];
const lifecycleContent = lifecycle.replace(/^projectId: .*\n?/m, "")
  .replace("name: X1 HQ Pilot", `name: ${profile.name}`)
  .replace("name: X1 HQ Copilot Chat Pilot", `name: ${profile.name} Copilot Chat`)
  .replace("scope: settings.read,reports.read", `scope: ${profile.scopes.join(",")}`)
  .replace(`baseUrl: ${stagingEndpoint}`, `baseUrl: ${profile.endpoint}`);
assert.ok(lifecycleContent.includes(`scope: ${profile.scopes.join(",")}\n`)
  && lifecycleContent.includes(`baseUrl: ${profile.endpoint}\n`), "The OAuth configuration must match the profile.");

// Allow time for auth and transport within Copilot's per-action deadline.
function adaptPollingForCopilot(content) {
  return content.replace(/waitMs([:=]\s*)10000/g, (_, separator) => `waitMs${separator}0`)
    .replace("while queued/running to avoid rapid polling", "for an immediate status check while queued/running");
}

function updateReportCapabilityRows(content) {
  return content.split("\n").map(line => {
    const name = /^\| `(get_task_status|call_hq_read_tool)` \|/.exec(line)?.[1];
    if (!name) return line;
    const tool = byName.get(name);
    const cells = line.split(" | ");
    assert.equal(cells.length, 7, "Unexpected skill capability table format.");
    cells[3] = tool._meta["hq-agent-platform/schemaVersion"];
    cells[6] = tool.description + " |";
    return cells.join(" | ");
  }).join("\n");
}

const preparedSkills = [];
for (const name of profile.skills) {
  const source = path.join(portable, "skills", name);
  const raw = await readFile(path.join(source, "SKILL.md"), "utf8");
  assert.match(raw, /## Connection binding\n\n[\s\S]*?(?=\n## )/, `Missing the connection binding in ${name}.`);
  let skill = adaptPollingForCopilot(raw).replace(/## Connection binding\n\n[\s\S]*?(?=\n## )/,
    `## Connection binding\n\nUse this agent's **${profile.name}** MCP action at \`${profile.endpoint}\` for status, discovery, workspace selection, and business calls. For an access-list question, list accessible workspaces without selecting one. Use the exact task-specific tool when callable. If it is unavailable, use \`find_hq_tools\` and its returned dispatcher when available. Report missing tools or scopes without switching connectors.\n`);
  if (name === "analyze-x1-hq-reports") {
    skill = skill.replace("Use the exact task-specific tool when callable.",
      "Follow the background report workflow below for every report.");
  }
  const references = [];
  if (name === "import-menu-from-document") {
    const start = skill.indexOf("## Preserve language placement\n");
    const end = skill.indexOf("## Persist before asking questions\n");
    assert.ok(start >= 0 && end > start, "The import skill's draft guidance changed location.");
    references.push(["draft-records.md", `# Menu import draft records\n\n${skill.slice(start, end).trimEnd()}\n`]);
    skill = skill.slice(0, start) + "## Build the draft\n\n"
      + "Read [the language and draft-record rules](references/draft-records.md) before constructing or amending a draft. "
      + "Apply those rules to source evidence, names, codes, quantities, prices, choices, modifiers, ordering, channels, and corrections.\n\n"
      + skill.slice(end);
  }
  assert.ok(skill.length < 20000, `${name} exceeds the Microsoft skill instruction limit.`);
  const sourceReferences = path.join(source, "references");
  for (const entry of await readdir(sourceReferences, { withFileTypes: true })) {
    assert.ok(entry.isFile() && entry.name.endsWith(".md"), `Unexpected skill reference: ${name}/${entry.name}.`);
    assert.ok(!references.some(([file]) => file === entry.name), `Duplicate skill reference: ${name}/${entry.name}.`);
    let content = await readFile(path.join(sourceReferences, entry.name), "utf8");
    if (entry.name === "capabilities.md") content = updateReportCapabilityRows(content);
    references.push([entry.name, adaptPollingForCopilot(content)]);
  }
  preparedSkills.push({ name, skill, references });
}

await mkdir(app, { recursive: true });
await mkdir(path.join(output, "env"), { recursive: true });
await writeFile(path.join(output, "env/.env.dev"),
  "TEAMS_APP_ID=\nX1_MCP_AUTH_ID=\nM365_TITLE_ID=\nM365_APP_ID=\n", { flag: "wx" }).catch((error) => {
  if (error.code !== "EEXIST") throw error;
});
await Promise.all([
  writeJson(path.join(app, "manifest.json"), manifest),
  writeJson(path.join(app, "declarativeAgent.json"), agent),
  writeJson(path.join(app, "ai-plugin.json"), plugin),
  writeFile(path.join(app, "instructions.txt"), instructions
    .replaceAll("{{AGENT_NAME}}", profile.name)
    .replaceAll("{{WORKSPACE}}", profile.workspace ?? "")),
  writeFile(lifecyclePath, `${lifecycleContent.trimEnd()}\n${projectId ? `${projectId}\n` : ""}`),
  ...["color.png", "outline.png"].map((file) => cp(path.join(pilotApp, file), path.join(app, file))),
  cp(path.join(pilot, "env/oauth.env.example"), path.join(output, "env/oauth.env.example"))
]);
for (const { name, skill, references } of preparedSkills) {
  const skillDirectory = path.join(app, "skills", name);
  await rm(skillDirectory, { recursive: true, force: true });
  await mkdir(path.join(skillDirectory, "references"), { recursive: true });
  await writeFile(path.join(skillDirectory, "SKILL.md"), skill);
  await Promise.all(references.map(([file, contents]) =>
    writeFile(path.join(skillDirectory, "references", file), contents)));
}

const toolSummary = profile.tools ? `${selectedTools.length} pinned tools`
  : `dynamic discovery of the complete gateway catalog (${selectedTools.length} tools advertised)`;
console.log(`Prepared ${profile.name} at ${output} with ${profile.skills.length} skills and ${toolSummary}.`);
