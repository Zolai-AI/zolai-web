/**
 * Static endpoint table for the external zolai-core HTTP API.
 * Mirrors zolai-core/docs/api-contract.md exactly. Every external call the
 * desktop dashboard makes must resolve against one of these paths.
 */
export const CORE_ENDPOINTS = {
  // Application routes (zolai.api.server)
  health: "/health",
  bibleSearch: "/bible/search",
  dictSearchAll: "/dictionary/search/all",
  dictSearchMy: "/dictionary/search/my",
  dictAdd: "/dictionary/add",
  dictUpdate: "/dictionary/update",
  dictDelete: "/dictionary/delete",
  monitorHealth: "/monitor/health",
  monitorCoverage: "/monitor/coverage",
  monitorAudit: "/monitor/audit",

  // Desktop router (zolai.api.desktop_router)
  desktopStats: "/desktop/stats",
  desktopTables: "/desktop/tables",
  desktopQuery: "/desktop/query",
  desktopDictBrowse: "/desktop/dict/browse",
  desktopNonZolai: "/desktop/dict/non-zolai",
  desktopBibleStudy: "/desktop/bible/study",
  desktopBibleLearn: "/desktop/bible/learn",
  desktopBibleContextBook: "/desktop/bible/context/book",
  desktopBibleContextWord: "/desktop/bible/context/word",
  desktopBibleContextTopics: "/desktop/bible/context/topics",
  geminiFillEn: "/desktop/gemini/fill-en",
  geminiFillMy: "/desktop/gemini/fill-my",
  geminiCoverage: "/desktop/gemini/coverage",
  desktopTrainingGenerate: "/desktop/training/generate",
  desktopTrainingBuild: "/desktop/training/build",
  desktopTrainingBuildQwen: "/desktop/training/build-qwen",
  desktopExport: "/desktop/export",
  desktopQuiz: "/desktop/test/quiz",
  desktopGrammarCheck: "/desktop/grammar/check",
  desktopParagraphAnalyze: "/desktop/paragraph/analyze",
  desktopZvsValidate: "/desktop/zvs/validate",
  desktopAuditRecent: "/desktop/audit/recent",
} as const;

export type CoreEndpointKey = keyof typeof CORE_ENDPOINTS;

/** Chat/session endpoints on zolai-core’s application layer. */
export const CHAT_ENDPOINTS = {
  /** OpenAI-compatible streaming chat. */
  stream: "/chat/chat/stream",
  /** Zolai-aware chat mode. */
  zolai: "/chat/zolai",
} as const;

/** Data types the desktop export endpoint accepts (path segment). */
export const EXPORT_TYPES = [
  "dictionary",
  "bible",
  "vocabulary",
  "grammar",
  "phrases",
  "exercises",
] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];