"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, getSectionForPathname } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasSection } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to let zustand hydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Route-level RBAC guard: mirrors the sidebar's filtering so a restricted
  // sub-admin can't reach a hidden section just by typing its URL. Uses the
  // same pathname -> AdminSection lookup the Sidebar uses, so the two can't
  // drift out of sync. /dashboard itself is never gated.
  const currentSection =
    pathname === "/dashboard" ? null : getSectionForPathname(pathname);
  const isSectionAllowed = !currentSection || hasSection(currentSection);

  useEffect(() => {
    if (isLoading) return;
    if (!isSectionAllowed) {
      router.replace("/dashboard");
    }
  }, [isLoading, isSectionAllowed, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  // Don't flash restricted content while the redirect above is in flight.
  if (!isSectionAllowed) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="flex bg-white h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
