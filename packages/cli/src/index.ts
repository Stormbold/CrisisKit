#!/usr/bin/env node
import { Command } from "commander";
import { runInit, TEMPLATES } from "./commands/init.js";
import { runBuild } from "./commands/build.js";
import { runPreview } from "./commands/preview.js";
import { runValidate } from "./commands/validate.js";
import { runEdit } from "./commands/edit.js";

const program = new Command();

program
  .name("crisiskit")
  .description("Build offline emergency pages from simple YAML files")
  .version("0.1.0");

program
  .command("init")
  .description("Create a new CrisisKit project from a template")
  .option("--template <name>", `Template (${TEMPLATES.join(", ")})`)
  .option("--dir <path>", "Output directory", "./crisiskit")
  .action(async (opts: { template?: string; dir: string }) => {
    try {
      const template = opts.template as (typeof TEMPLATES)[number] | undefined;
      if (template && !TEMPLATES.includes(template)) {
        console.error(`Invalid template: ${template}. Choose: ${TEMPLATES.join(", ")}`);
        process.exit(1);
      }
      await runInit({ template, dir: opts.dir });
    } catch (error) {
      console.error(`\n✗ ${error instanceof Error ? error.message : error}\n`);
      process.exit(1);
    }
  });

program
  .command("build")
  .description("Build static HTML and PDF output from YAML files")
  .option("--input <path>", "Input directory with YAML files", "./crisiskit")
  .option("--output <path>", "Output directory", "./dist")
  .option("--skip-pdf", "Skip PDF generation")
  .action(async (opts: { input: string; output: string; skipPdf?: boolean }) => {
    try {
      await runBuild(opts);
    } catch (error) {
      console.error(`\n✗ ${error instanceof Error ? error.message : error}\n`);
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Preview built output locally")
  .option("--dir <path>", "Directory to serve", "./dist")
  .option("--port <number>", "Port number", "4173")
  .action(async (opts: { dir: string; port: string }) => {
    try {
      await runPreview({ dir: opts.dir, port: parseInt(opts.port, 10) });
    } catch (error) {
      console.error(`\n✗ ${error instanceof Error ? error.message : error}\n`);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate YAML project files")
  .option("--input <path>", "Input directory with YAML files", "./crisiskit")
  .action((opts: { input: string }) => {
    const code = runValidate(opts);
    process.exit(code);
  });

program
  .command("edit")
  .description("Edit YAML project files in the browser")
  .option("--input <path>", "Input directory with YAML files", "./crisiskit")
  .option("--output <path>", "Build output directory", "./dist")
  .option("--port <number>", "Editor port", "4321")
  .action(async (opts: { input: string; output: string; port: string }) => {
    try {
      await runEdit({
        input: opts.input,
        output: opts.output,
        port: parseInt(opts.port, 10),
      });
    } catch (error) {
      console.error(`\n✗ ${error instanceof Error ? error.message : error}\n`);
      process.exit(1);
    }
  });

program.parse();
