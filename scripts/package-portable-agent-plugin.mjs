import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const pluginRoot = path.join(repositoryRoot, "plugins", "x1-hq");
const artifactRoot = path.join(repositoryRoot, ".artifacts", "agent-plugin");
const packageRoot = path.join(artifactRoot, "x1-hq");

const readJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));
const exists = async (filePath) => access(filePath).then(() => true, () => false);

const collectFiles = async (root, directory = root) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, target));
    } else if (entry.isFile()) {
      files.push(path.relative(root, target));
    }
  }
  return files.sort();
};

const digestFile = async (filePath) => createHash("sha256")
  .update(await readFile(filePath))
  .digest("hex");

const manifest = await readJson(path.join(pluginRoot, "plugin.json"));
const mcp = await readJson(path.join(pluginRoot, "mcp.json"));
const marketplace = await readJson(
  path.join(repositoryRoot, ".agents", "plugins", "marketplace.json")
);
const entry = marketplace.plugins.find((plugin) => plugin.name === manifest.name);
assert.equal(entry?.source?.source, "local", "Marketplace must use the local portable package.");
assert.equal(path.resolve(repositoryRoot, entry.source.path), pluginRoot,
  "Marketplace must install the same directory as the release artifact.");
assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
assert.equal(manifest.name, "x1-hq");
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(mcp.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json");
assert.deepEqual(mcp.mcpServers, {
  "x1-hq": { type: "streamable-http", url: "https://mcp.x1.tech/mcp" }
}, "Public package must connect directly to the X1 MCP gateway without bundled credentials.");
for (const legacyPath of [".app.json", ".codex-plugin", ".claude-plugin", ".mcp.json"]) {
  assert.equal(await exists(path.join(pluginRoot, legacyPath)), false,
    `Portable package must not contain ${legacyPath}.`);
}
assert.equal(Object.hasOwn(manifest, "apps"), false,
  "Portable manifest must not reference registered apps.");
const skillDirectories = (await readdir(path.join(pluginRoot, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory());
assert.ok(skillDirectories.length > 0, "Marketplace package must include skills.");
for (const skill of skillDirectories) {
  assert.ok(await exists(path.join(pluginRoot, "skills", skill.name, "SKILL.md")),
    `Skill ${skill.name} is missing SKILL.md.`);
}

await rm(artifactRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });

await cp(pluginRoot, packageRoot, { recursive: true, dereference: false });
const sourceFiles = await collectFiles(pluginRoot);
assert.deepEqual(await collectFiles(packageRoot), sourceFiles,
  "Release file inventory must match the marketplace package.");

const inventory = [];
for (const relativePath of await collectFiles(packageRoot)) {
  const digest = await digestFile(path.join(packageRoot, relativePath));
  assert.equal(digest, await digestFile(path.join(pluginRoot, relativePath)),
    `Release file differs from marketplace package: ${relativePath}`);
  inventory.push(`${digest}  x1-hq/${relativePath}`);
}

await writeFile(
  path.join(artifactRoot, "SHA256SUMS"),
  `${inventory.join("\n")}\n`,
  "utf8"
);

console.log(`Packaged portable Agent Plugin ${manifest.version} at ${packageRoot}`);
console.log(`Wrote ${inventory.length} SHA-256 entries.`);
