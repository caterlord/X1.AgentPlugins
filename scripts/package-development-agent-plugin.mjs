import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(repositoryRoot, "plugins", "x1-hq");
const artifactRoot = path.join(repositoryRoot, ".artifacts", "agent-plugin-dev");
const packageRoot = path.join(artifactRoot, "x1-hq-dev");
const manifest = JSON.parse(await readFile(path.join(sourceRoot, "plugin.json"), "utf8"));
const version = process.argv[2] ?? `${manifest.version}-dev.1`;
assert.match(version, /^\d+\.\d+\.\d+-dev\.\d+$/);
assert.equal(version.split("-dev.")[0], manifest.version,
  "Development version must identify the same production source baseline.");
const productionUrl = "https://mcp.posx1.ai/mcp";
const developmentUrl = "https://x1hq-mcp-staging.azurewebsites.net/mcp";
const mcp = JSON.parse(await readFile(path.join(sourceRoot, "mcp.json"), "utf8"));
assert.deepEqual(mcp.mcpServers, {
  "x1-hq": { type: "streamable-http", url: productionUrl }
});

const collectFiles = async (root, directory = root) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(root, target));
    else {
      assert.ok(entry.isFile(), "Plugin source must contain ordinary files only.");
      files.push(path.relative(root, target));
    }
  }
  return files.sort();
};
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
await rm(artifactRoot, { recursive: true, force: true });
await mkdir(artifactRoot, { recursive: true });
await cp(sourceRoot, packageRoot, { recursive: true });
const overrides = new Set(["plugin.json", "mcp.json", "INSTALLATION.md", "README.md"]);
const developmentManifest = {
  ...manifest,
  name: "x1-hq-dev",
  version,
  description: "Develop and test X1 HQ workflows through the authenticated staging MCP gateway.",
  keywords: [...new Set([...manifest.keywords, "staging", "development"])]
};
await writeFile(path.join(packageRoot, "plugin.json"), `${JSON.stringify(developmentManifest, null, 2)}\n`);
await writeFile(path.join(packageRoot, "mcp.json"), `${JSON.stringify({
  ...mcp,
  mcpServers: { "x1-hq-dev": { type: "streamable-http", url: developmentUrl } }
}, null, 2)}\n`);

const header = `# X1 HQ development package\n\nGenerated from production package ${manifest.version} as ${version}.\nUse direct MCP server \`x1-hq-dev\` at \`${developmentUrl}\`.\nThe shared production installation guide below describes the public package;\nthis development package retains its staging identity and endpoint.\n\n`;
for (const relativePath of ["INSTALLATION.md", "README.md"]) {
  const file = path.join(packageRoot, relativePath);
  await writeFile(file, header + await readFile(file, "utf8"));
}
const sourceFiles = await collectFiles(sourceRoot);
const expectedFiles = new Map();
for (const relativePath of sourceFiles) {
  if (!/^skills\/[^/]+\/SKILL\.md$/.test(relativePath)) continue;
  const original = await readFile(path.join(sourceRoot, relativePath), "utf8");
  const binding = "Use the direct MCP server `x1-hq` at `https://mcp.posx1.ai/mcp`";
  assert.equal(original.split(binding).length, 2, `${relativePath} must have one connection binding.`);
  const updated = original.replace(binding,
    `Use the direct MCP server \`x1-hq-dev\` at \`${developmentUrl}\``);
  expectedFiles.set(relativePath, updated);
  overrides.add(relativePath);
  await writeFile(path.join(packageRoot, relativePath), updated);
}
assert.equal(expectedFiles.size, 5, "All five skills must retain a development connection binding.");
assert.deepEqual(await collectFiles(packageRoot), sourceFiles);
const baseline = [];
const checksums = [];
for (const relativePath of sourceFiles) {
  const sourceBytes = await readFile(path.join(sourceRoot, relativePath));
  const packageBytes = await readFile(path.join(packageRoot, relativePath));
  if (!overrides.has(relativePath)) assert.deepEqual(packageBytes, sourceBytes, relativePath);
  if (expectedFiles.has(relativePath)) assert.equal(packageBytes.toString(), expectedFiles.get(relativePath));
  baseline.push({ path: relativePath, sha256: digest(sourceBytes), developmentOverlay: overrides.has(relativePath) });
  checksums.push(`${digest(packageBytes)}  x1-hq-dev/${relativePath}`);
}
await writeFile(path.join(artifactRoot, "BASELINE.json"), `${JSON.stringify({
  productionVersion: manifest.version, developmentVersion: version, files: baseline
}, null, 2)}\n`);
await writeFile(path.join(artifactRoot, "SHA256SUMS"), `${checksums.join("\n")}\n`);
console.log(`Packaged development Agent Plugin ${version} from production ${manifest.version}.`);
console.log(`Verified ${sourceFiles.length} files; ${overrides.size} explicit identity/documentation overlays.`);
