"use client";

import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const { user } = useAuthStore();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 font-sans">
      {/* Empty spacer for left side */}
      <div className="flex-1"></div>

      <div className="flex items-center gap-4 ml-4">
        <div className="w-8 h-8 rounded bg-[#1e2667] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
