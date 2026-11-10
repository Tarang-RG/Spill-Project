import { Clock } from "lucide-react";

export default function RecentActivity() {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock size={19} className="text-slate-500" />
        <h3 className="text-lg font-bold text-slate-900">
          Recent Activity
        </h3>
      </div>

      <div className="py-10 text-center">
        <p className="text-slate-500 text-sm">
          No recent activity to show.
        </p>
      </div>
    </section>
  );
}