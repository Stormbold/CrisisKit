import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { parse as parseYaml } from "yaml";
import type { ZodType, ZodError, output } from "zod";

export class YamlParseError extends Error {
  constructor(
    public readonly filePath: string,
    message: string,
  ) {
    super(message);
    this.name = "YamlParseError";
  }
}

export class YamlValidationError extends Error {
  constructor(
    public readonly filePath: string,
    public readonly zodError: ZodError,
  ) {
    const issues = zodError.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    super(`${basename(filePath)} validation failed:\n${issues}`);
    this.name = "YamlValidationError";
  }
}

export function parseYamlFile<T extends ZodType>(
  filePath: string,
  schema: T,
): output<T> {
  let raw: unknown;
  try {
    const content = readFileSync(filePath, "utf-8");
    raw = parseYaml(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new YamlParseError(filePath, `Failed to parse ${basename(filePath)}: ${message}`);
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new YamlValidationError(filePath, result.error);
  }

  return result.data;
}

export function parseYamlString<T extends ZodType>(
  content: string,
  schema: T,
): output<T> {
  const raw = parseYaml(content);
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
