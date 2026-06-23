import {
  LayoutDashboard,
  Folder,
  FileJson,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-10">
        GenForge
      </h1>

      <nav className="space-y-5">

        <div className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
          <LayoutDashboard />
          Dashboard
        </div>

        <div className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
          <Folder />
          Projects
        </div>

        <div className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
          <FileJson />
          JSON Editor
        </div>

        <div className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
          <Settings />
          Settings
        </div>

      </nav>

      <button className="mt-20 flex items-center gap-3 text-red-400 hover:text-red-300">

        <LogOut />

        Logout

      </button>

    </aside>
  );
}