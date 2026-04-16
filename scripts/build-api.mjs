import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

await build({
  entryPoints: [path.resolve(root, "server/api-handler.ts")],
  outfile: path.resolve(root, "api/index.js"),
  platform: "node",
  target: "node20",
  format: "esm",
  bundle: true,
  packages: "external",
  alias: {
    "@shared": path.resolve(root, "shared"),
  },
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
});

console.log("API function bundled to api/index.js");
