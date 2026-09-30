import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "deploy", "shared-hosting-fallback");
const canonicalAssets = path.join(root, "apps", "web", "public", "assets");
const out = path.join(root, "dist", "shared-hosting-fallback");

for (const required of [
  path.join(source, "index.html"),
  path.join(source, "api", "index.php"),
  path.join(source, "assets", "thc-u-know.js"),
  path.join(source, "assets", "thc-u-know.css"),
  canonicalAssets
]) {
  if (!existsSync(required)) {
    throw new Error(`Missing shared-hosting fallback input: ${path.relative(root, required)}`);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "assets"), { recursive: true });

cpSync(path.join(source, "index.html"), path.join(out, "index.html"));
cpSync(path.join(source, "api"), path.join(out, "api"), { recursive: true });
cpSync(canonicalAssets, path.join(out, "assets"), { recursive: true });
cpSync(path.join(source, "assets", "thc-u-know.js"), path.join(out, "assets", "thc-u-know.js"));
cpSync(path.join(source, "assets", "thc-u-know.css"), path.join(out, "assets", "thc-u-know.css"));

console.log(`Built THC U Know shared-hosting fallback: ${path.relative(root, out)}`);
