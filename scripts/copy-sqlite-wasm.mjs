import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const PKG_DIST = resolve("node_modules/@sqlite.org/sqlite-wasm/dist");
const PUBLIC_DIR = resolve("public/sqlite-wasm");

const ASSETS = [
  "sqlite3-worker1.mjs",
  "sqlite3-opfs-async-proxy.js",
  "sqlite3.wasm",
];

if (!existsSync(PKG_DIST)) {
  console.warn("[sqlite-wasm] source not found, skipping copy");
  process.exit(0);
}

mkdirSync(PUBLIC_DIR, { recursive: true });

for (const asset of ASSETS) {
  const src = resolve(PKG_DIST, asset);
  const dest = resolve(PUBLIC_DIR, asset);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

console.log(`[sqlite-wasm] copied ${ASSETS.length} files to ${PUBLIC_DIR}`);
