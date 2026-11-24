"use client";
import Link from "next/link";
import { useN8nDashboard, useTriggerPipeline } from "@/features/admin/hooks/useN8nDashboard";

export default function N8nDashboardPage() {
  const { data: stats = null } = useN8nDashboard();
  const trigger = useTriggerPipeline();

  function triggerPipeline() {
    trigger.mutate();
  }

  const statusColor = (s: string) =>
    ({ done: "text-green-600", error: "text-red-600", running: "text-blue-600" }[s] ?? "text-gray-500");

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Automation Dashboard</h1>
        <button onClick={triggerPipeline} disabled={trigger.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {trigger.isPending ? "Triggering..." : "▶ Run Pipeline Now"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Pending Contributions</p>
          <p className="text-3xl font-bold">{stats?.pendingContributions ?? "—"}</p>
          <Link href="/admin/contributions" className="text-blue-600 text-sm">Review →</Link>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Telegram Subscribers</p>
          <p className="text-3xl font-bold">{stats?.subscriberCount ?? "—"}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Last HF Publish</p>
          <p className="text-sm font-medium mt-1">
            {stats?.lastPublish ? new Date(stats.lastPublish).toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Recent Pipeline Runs</h2>
      {!stats?.recentRuns?.length && <p className="text-gray-500 text-sm">No runs yet.</p>}
      <div className="space-y-2">
        {stats?.recentRuns?.map((run) => (
          <div key={run.jobId} className="border rounded p-3 flex justify-between items-center text-sm">
            <div>
              <span className="font-mono text-xs text-gray-400 mr-2">{run.jobId}</span>
              <span className="font-medium">{run.stage}</span>
              {run.recordsAdded > 0 && <span className="text-gray-500 ml-2">+{run.recordsAdded} records</span>}
              {run.error && <p className="text-red-500 text-xs mt-1">{run.error}</p>}
            </div>
            <div className="text-right">
              <span className={`font-medium ${statusColor(run.status)}`}>{run.status}</span>
              <p className="text-xs text-gray-400">{new Date(run.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
