# Progress Tracker

## 2026-09-28 — Edge Monitor cron thinned to daily
- `.github/workflows/monitor.yml`: cron `0 */6 * * *` → `0 8 * * *` (daily 08:00 UTC).
- Commit `fb3c2a8` pushed to `origin/main`. Tree clean.
- Accepted trade-off: edge outage detection latency is now ~24h instead of ~6h. The Telegram alert still fires on failure.
- `workflow_dispatch` remains available for on-demand runs; the job-level `concurrency` group `zolai-edge-monitor` is unchanged.
- No other workflow YAML modified; Dependabot untouched.

## 2026-09-04 — Setup baseline
- Repo connected to `Zolai-AI/zolai-web`.
- Received `website/` (3.4GB Next.js app) from monorepo distribution.
- Push unblocked after removing Slack webhook test URLs.

## 2026-09-04
- Flattened website structure (source moved from website/zolai-project/ to repo root)
- Fixed ESLint warnings
