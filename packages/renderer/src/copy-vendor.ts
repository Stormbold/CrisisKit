import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const rendererRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(rendererRoot, "package.json"));

const PACKAGES_TO_COPY = [
  "@material/web",
  "lit",
  "lit-html",
  "lit-element",
  "@lit/reactive-element",
  "tslib",
] as const;

const PACKAGE_ENTRIES: Record<(typeof PACKAGES_TO_COPY)[number], string> = {
  "@material/web": "@material/web/button/filled-button.js",
  lit: "lit",
  "lit-html": "lit-html",
  "lit-element": "lit-element",
  "@lit/reactive-element": "@lit/reactive-element",
  tslib: "tslib",
};

function resolvePackageDir(name: (typeof PACKAGES_TO_COPY)[number]): string {
  const entry = require.resolve(PACKAGE_ENTRIES[name]);
  let dir = dirname(entry);

  for (let depth = 0; depth < 12; depth++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { name?: string };
      if (pkg.name === name) {
        return dir;
      }
    }
    dir = dirname(dir);
  }

  throw new Error(`Could not resolve package directory for ${name}`);
}

export function copyVendorAssets(outputDir: string): void {
  const vendorDir = join(outputDir, "assets", "vendor");
  mkdirSync(vendorDir, { recursive: true });

  for (const pkg of PACKAGES_TO_COPY) {
    const source = resolvePackageDir(pkg);
    const target = join(vendorDir, pkg);
    cpSync(source, target, { recursive: true, force: true });
  }
}

export function getImportMapJson(): string {
  return JSON.stringify(
    {
      imports: {
        "@material/web/": "./assets/vendor/@material/web/",
        lit: "./assets/vendor/lit/index.js",
        "lit/": "./assets/vendor/lit/",
        "lit-html": "./assets/vendor/lit-html/lit-html.js",
        "lit-html/": "./assets/vendor/lit-html/",
        "lit-element": "./assets/vendor/lit-element/index.js",
        "lit-element/": "./assets/vendor/lit-element/",
        "@lit/reactive-element": "./assets/vendor/@lit/reactive-element/reactive-element.js",
        "@lit/reactive-element/": "./assets/vendor/@lit/reactive-element/",
        tslib: "./assets/vendor/tslib/tslib.es6.js",
      },
    },
    null,
    2,
  );
}
