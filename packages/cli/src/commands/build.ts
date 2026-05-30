import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadProject, validateProject } from "@crisiskit/core";
import { renderHtml, renderPdf, renderHomeAssistant } from "@crisiskit/renderer";

export interface BuildOptions {
  input: string;
  output: string;
  skipPdf?: boolean;
}

export async function runBuild(options: BuildOptions): Promise<void> {
  const inputDir = resolve(options.input);
  const outputDir = resolve(options.output);

  console.log(`\nBuilding from ${inputDir}...\n`);

  const data = loadProject(inputDir);
  const validation = validateProject(data);

  for (const issue of validation.issues) {
    const prefix = issue.level === "error" ? "✗" : "⚠";
    const file = issue.file ? ` ${issue.file}` : "";
    console.log(`${prefix}${file} ${issue.message}`);
  }

  if (!validation.valid) {
    throw new Error("Build aborted due to validation errors.");
  }

  mkdirSync(outputDir, { recursive: true });

  const htmlResult = renderHtml(data, outputDir);
  console.log(`✓ Generated ${htmlResult.files.length} HTML files`);

  if (!options.skipPdf) {
    console.log("  Generating PDFs (Playwright)...");
    const pdfResult = await renderPdf(outputDir, { outputDir });
    console.log(`✓ Generated ${pdfResult.files.length} PDF files`);
  }

  const haResult = renderHomeAssistant(data, outputDir);
  if (haResult) {
    console.log(`✓ Generated ${haResult.files.length} Home Assistant files`);
    console.log(`  Copy dist/ to /config/www/${data.homeAssistant!.www.subdirectory}/`);
    console.log("  See dist/home-assistant/INSTALL.md for Lovelace dashboard setup.");
  } else if (data.homeAssistant && !data.homeAssistant.enabled) {
    console.log("ℹ Home Assistant export skipped (enabled: false in home-assistant.yml)");
  }

  console.log(`\n✓ Build complete: ${outputDir}`);
  console.log(
    "\n⚠ Warning: Your generated site may contain private contacts, addresses or medical notes.",
  );
  console.log("  Only publish it publicly if you have reviewed and removed sensitive information.\n");
}
