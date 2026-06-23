import { Bell, UserCircle2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between bg-white shadow-sm px-8 py-4 border-b">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          AI App Generator
        </h1>
        <p className="text-sm text-gray-500">
          Build applications from JSON
        </p>
      </div>

      <div className="flex items-center gap-5">
        <Bell className="cursor-pointer text-gray-600 hover:text-blue-600" />

        <div className="flex items-center gap-2">
          <UserCircle2 size={35} />
          <div>
            <h2 className="font-semibold">Pooja</h2>
            <p className="text-xs text-gray-500">
              Software Engineer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}