import { createServer } from "node:http";
import { resolve } from "node:path";
import handler from "serve-handler";

export interface PreviewOptions {
  dir: string;
  port: number;
}

export async function runPreview(options: PreviewOptions): Promise<void> {
  const dir = resolve(options.dir);
  const port = options.port;

  const server = createServer((request, response) =>
    handler(request, response, {
      public: dir,
      cleanUrls: false,
    }),
  );

  await new Promise<void>((resolvePromise) => {
    server.listen(port, () => {
      console.log(`\n✓ Preview server running at http://localhost:${port}`);
      console.log(`  Serving: ${dir}`);
      console.log("  Press Ctrl+C to stop.\n");
      resolvePromise();
    });
  });

  await new Promise(() => {
    /* keep process alive until interrupted */
  });
}
