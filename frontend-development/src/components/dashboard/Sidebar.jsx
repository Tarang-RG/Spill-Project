import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  Wallet,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Groups", icon: Users },
  { name: "Activity", icon: Activity },
  { name: "Settings", icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col p-6">

      {/* BRAND */}
      <div className="flex items-center gap-3 mb-12">
        <div className="bg-green-500 p-2 rounded-xl">
          <Wallet size={24} />
        </div>

        <h1 className="text-2xl font-bold">
          Spill<span className="text-green-400">.</span>
        </h1>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActivePage(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                active
                  ? "bg-green-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}