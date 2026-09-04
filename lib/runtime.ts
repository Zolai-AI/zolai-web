export function isDesktop(): boolean {
  // Tauri injects global `window.__TAURI__` (v1) and `window.__TAURI_INTERNALS__` (v2).
  // We check both to keep builds resilient across upgrades.
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
}

