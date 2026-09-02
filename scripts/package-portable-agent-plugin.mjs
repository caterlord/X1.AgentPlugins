import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const workspacePluginRoot = path.join(repositoryRoot, "plugins", "x1-hq");
const portableManifestRoot = path.join(repositoryRoot, "portable", "x1-hq");
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

const workspaceManifest = await readJson(
  path.join(workspacePluginRoot, ".codex-plugin", "plugin.json")
);
const portableManifest = await readJson(
  path.join(portableManifestRoot, "plugin.json")
);
const appManifest = await readJson(path.join(workspacePluginRoot, ".app.json"));
const appReference = appManifest.apps?.["x1-hq"];

if (workspaceManifest.name !== portableManifest.name) {
  throw new Error("Workspace and portable plugin names must match.");
}
if (workspaceManifest.version !== portableManifest.version) {
  throw new Error("Workspace and portable plugin versions must match.");
}
if (workspaceManifest.apps !== "./.app.json") {
  throw new Error("Workspace plugin must reference ./.app.json.");
}
if (!appReference?.id?.startsWith("asdk_app_") || appReference.required !== true) {
  throw new Error("Workspace app reference must use a required asdk_app_ identifier.");
}
for (const desktopOnlyManifest of ["mcp.json", ".mcp.json", "plugin.json"]) {
  if (await exists(path.join(workspacePluginRoot, desktopOnlyManifest))) {
    throw new Error(
      `Workspace plugin must not contain portable manifest ${desktopOnlyManifest}.`
    );
  }
}

await rm(artifactRoot, { recursive: true, force: true });
await mkdir(packageRoot, { recursive: true });

for (const entry of ["CHANGELOG.md", "README.md", "evals", "schemas", "skills"]) {
  await cp(
    path.join(workspacePluginRoot, entry),
    path.join(packageRoot, entry),
    { recursive: true }
  );
}
await cp(
  path.join(portableManifestRoot, "plugin.json"),
  path.join(packageRoot, "plugin.json")
);
await cp(
  path.join(portableManifestRoot, "mcp.json"),
  path.join(packageRoot, "mcp.json")
);

const inventory = [];
for (const relativePath of await collectFiles(packageRoot)) {
  const digest = await digestFile(path.join(packageRoot, relativePath));
  inventory.push(`${digest}  x1-hq/${relativePath}`);
}

await writeFile(
  path.join(artifactRoot, "SHA256SUMS"),
  `${inventory.join("\n")}\n`,
  "utf8"
);

console.log(`Packaged portable Agent Plugin ${portableManifest.version} at ${packageRoot}`);
console.log(`Wrote ${inventory.length} SHA-256 entries.`);
