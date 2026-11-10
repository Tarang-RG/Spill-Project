import { Bell } from "lucide-react";

export default function Header({ user }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(" ")[0] || "User"}!
        </h2>

        <p className="text-slate-500 mt-1">
          Here's what's happening with your expenses.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600">
          <Bell size={20} />
        </button>

        <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
          {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}