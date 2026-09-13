import { z } from "zod";

// ────────────────────────────────────────────────────────────────────────────
// zod schemas for strict, well-defined zolai-core endpoints (see
// zolai-core/docs/api-contract.md). The run-script endpoints are intentionally
// schemaless and are handled as `unknown` in client.ts.
// ────────────────────────────────────────────────────────────────────────────

export const tableInfoSchema = z.object({
  name: z.string().default(""),
  rows: z.number().nullish(),
  size: z.union([z.number(), z.string()]).nullish(),
});
export type TableInfo = z.infer<typeof tableInfoSchema>;

export const desktopStatsSchema = z.object({
  total_tables: z.number().default(0),
  total_rows: z.number().default(0),
  database_size_mb: z.number().default(0),
  dictionary: z
    .object({
      total: z.number().default(0),
      coverage_myanmar_pct: z.number().default(0),
    })
    .default({}),
  bible: z.object({ total_verses: z.number().default(0) }).default({}),
  training: z
    .object({
      translation_pairs: z.number().default(0),
      training_exercises: z.number().default(0),
      vocabulary_entries: z.number().default(0),
      phrases: z.number().default(0),
      grammar_patterns: z.number().default(0),
      proverbs: z.number().default(0),
      word_alignments: z.number().default(0),
      word_usage_profiles: z.number().default(0),
    })
    .default({}),
  provenance: z.object({ audit_log_entries: z.number().default(0) }).default({}),
  table_details: z.array(tableInfoSchema).default([]),
});
export type DesktopStats = z.infer<typeof desktopStatsSchema>;

export const tablesResponseSchema = z.object({
  tables: z.array(tableInfoSchema).default([]),
  total: z.number().default(0),
});
export type TablesResponse = z.infer<typeof tablesResponseSchema>;

export const queryResponseSchema = z.object({
  columns: z.array(z.string()).default([]),
  rows: z.array(z.array(z.unknown())).default([]),
  count: z.number().default(0),
});
export type QueryResponse = z.infer<typeof queryResponseSchema>;

export const healthSchema = z.object({
  status: z.string().optional(),
  version: z.string().nullish(),
  data_root: z.string().nullish(),
});
export type Health = z.infer<typeof healthSchema>;

// Loose schema for run-script endpoints (schemaless by design). We keep the
// parsed value typed as a permissive record but surface it as `unknown`.
export const runScriptSchema = z.record(z.string(), z.unknown());
export type RunScriptValue = Record<string, unknown>;