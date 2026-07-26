"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Grid,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Map,
  MessageSquare,
  LayoutGrid,
  Home,
  ShieldCheck,
  Layers,
  LucideIcon,
  Store,
  CreditCard,
  MapPin,
  GalleryHorizontal,
  Receipt,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";

type SidebarItem = {
  name: string;
  href?: string;
  icon: LucideIcon;
  children?: SidebarItem[];
};

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Agents", href: "/dashboard/agents", icon: UserCog },
  { name: "Sub Admins", href: "/dashboard/sub-admins", icon: ShieldCheck },
  { name: "Plots", href: "/dashboard/plots", icon: Grid },
  { name: "Layouts", href: "/dashboard/layouts", icon: Map },
  { name: "Transactions", href: "/dashboard/transactions", icon: FileText },
  {
    name: "Payment Transactions",
    href: "/dashboard/subscription-purchases",
    icon: Receipt,
  },
  { name: "Reports", href: "/dashboard/reports", icon: MessageSquare },
  {
    name: "Listing Requests",
    href: "/dashboard/listing-requests",
    icon: FileText,
  },
  {
    name: "Property Submissions",
    href: "/dashboard/property-submissions",
    icon: Home,
  },
  {
    name: "Pincodes",
    href: "/dashboard/pincodes",
    icon: MapPin,
  },
  {
    name: "Banners",
    href: "/dashboard/banners",
    icon: GalleryHorizontal,
  },
  {
    name: "Subscription Plans",
    href: "/dashboard/subscription-plans",
    icon: CreditCard,
  },

  {
    name: "Explore Categories",
    icon: Layers,
    children: [
      {
        name: "Land Protection",
        href: "/dashboard/explore-categories/land-protection",
        icon: ShieldCheck,
      },
      {
        name: "Assign - Land Protections",
        href: "/dashboard/assign-land-protections",
        icon: UserCog,
      },
      {
        name: "Land Registrations",
        href: "/dashboard/explore-categories/land-registrations",
        icon: FileText,
      },
      {
        name: "Layout Enquiries",
        href: "/dashboard/explore-categories/layout-enquiries",
        icon: Map,
      },
      {
        name: "Buy/Sell Plots",
        href: "/dashboard/explore-categories/buy-sell-plots",
        icon: Store,
      },
    ],
  },
  {
    name: "Quick Actions",
    icon: LayoutGrid,
    children: [
      {
        name: "Loan Eligibility",
        href: "/dashboard/loan-eligibility",
        icon: FileText,
      },
      {
        name: "Latest Listings",
        href: "/dashboard/latest-listings",
        icon: Home,
      },
      {
        name: "Legal Verification",
        href: "/dashboard/legal-verification",
        icon: ShieldCheck,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const userName = user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex-shrink-0 min-h-screen flex flex-col font-sans">
      <div className="p-6 flex items-center justify-center">
        <div className="relative w-40 h-12">
          <Image
            src="/logo.png"
            alt="LandWala"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isExpanded = openSections.includes(item.name);
          // Check if any child is active to highlight the parent if needed,
          // but usually we just highlight the child.
          // For the parent "Quick Actions", it might be highlighted if expanded?
          // The image shows it dark blue when expanded.

          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            const isChildActive = item.children?.some(
              (child) =>
                pathname === child.href || pathname.startsWith(child.href!),
            );

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleSection(item.name)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                    isChildActive
                      ? "bg-[#1e2667] text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const isChildPageActive = child.href
                        ? child.href === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname.startsWith(child.href)
                        : false;

                      return (
                        <Link
                          key={child.name}
                          href={child.href || "#"}
                          className={clsx(
                            "flex items-center gap-3 pl-11 pr-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            isChildPageActive
                              ? "bg-gray-100 text-[#1e2667]" // Sub-items style? or just text color?
                              : // Image shows the sub-items on white background (or light gray) with gray text,
                                // maybe specific active state?
                                // Let's assume standard logic: active = text-primary.
                                // In the image, "Blue" background is for the parent.
                                // The children seem to be on the white background.
                                "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                          )}
                        >
                          {child.icon && <child.icon className="w-4 h-4" />}
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href || "");

          return (
            <Link
              key={item.name}
              href={item.href || "#"}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-[#1e2667] text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-gray-100">
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded bg-[#1e2667] flex items-center justify-center text-white font-medium">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Welcome 👋</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </Link>
      </div>
    </aside>
  );
}
