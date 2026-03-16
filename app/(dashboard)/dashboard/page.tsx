import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Dashboard home — overview stats and recent activity.
 * TODO: Replace placeholders with real widgets in the dashboard feature task.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat cards placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Members", "Active Events", "Reports", "Pending"].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
            </div>
          ),
        )}
      </div>

      {/* Main content placeholder */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-400">
        Dashboard widgets — coming in the next task
      </div>
    </div>
  );
}
