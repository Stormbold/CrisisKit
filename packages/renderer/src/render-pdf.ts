import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

export interface RenderPdfOptions {
  outputDir: string;
}

export interface RenderPdfResult {
  files: string[];
}

export async function renderPdf(
  distDir: string,
  options: RenderPdfOptions,
): Promise<RenderPdfResult> {
  const pdfDir = join(options.outputDir, "pdf");
  mkdirSync(pdfDir, { recursive: true });

  const jobs = [
    {
      html: join(distDir, "emergency-card.html"),
      pdf: join(pdfDir, "emergency-card.pdf"),
      options: {
        width: "85mm",
        height: "55mm",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      },
    },
    {
      html: join(distDir, "offline-checklist.html"),
      pdf: join(pdfDir, "offline-checklist.pdf"),
      options: {
        format: "A4" as const,
        printBackground: true,
        margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
      },
    },
  ];

  const browser = await chromium.launch();
  const files: string[] = [];

  try {
    const page = await browser.newPage();

    for (const job of jobs) {
      await page.goto(pathToFileURL(job.html).href, { waitUntil: "networkidle" });
      await page.pdf({ path: job.pdf, ...job.options });
      files.push(`pdf/${job.pdf.split(/[/\\]/).pop()}`);
    }
  } finally {
    await browser.close();
  }

  return { files };
}

// PWA support (manifest + service worker) planned for v0.2
