"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Home,
  ShieldCheck,
  LucideIcon,
  Store,
  CreditCard,
  MapPin,
  GalleryHorizontal,
  Receipt,
  HardHat,
  Camera,
  PlusCircle,
  Scale,
  Landmark,
  Megaphone,
  LogOut,
  Layers,
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
  {
    name: "User Management",
    icon: Users,
    children: [{ name: "Users", href: "/dashboard/users", icon: Users }],
  },
  {
    name: "Agent Management",
    icon: UserCog,
    children: [
      { name: "Agents", href: "/dashboard/agents", icon: UserCog },
      { name: "Commissions", href: "/dashboard/transactions", icon: Receipt },
    ],
  },
  {
    name: "Property Management",
    icon: Home,
    children: [
      { name: "Add Property", href: "/dashboard/plots/create", icon: PlusCircle },
      { name: "All Properties", href: "/dashboard/plots", icon: Grid },
      {
        name: "Pending / Sell Requests",
        href: "/dashboard/property-submissions",
        icon: FileText,
      },
      { name: "Latest Listings", href: "/dashboard/latest-listings", icon: Home },
      { name: "Layouts", href: "/dashboard/layouts", icon: Map },
      { name: "Archived Properties", href: "/dashboard/plots/archived", icon: FileText },
    ],
  },
  {
    name: "Land Protection",
    icon: ShieldCheck,
    children: [
      {
        name: "Requests",
        href: "/dashboard/explore-categories/land-protection",
        icon: ShieldCheck,
      },
      {
        name: "Assign Employee",
        href: "/dashboard/assign-land-protections",
        icon: UserCog,
      },
    ],
  },
  {
    name: "Buy / Sell Plots",
    icon: Store,
    children: [
      {
        name: "All Listings",
        href: "/dashboard/explore-categories/buy-sell-plots",
        icon: Store,
      },
      {
        name: "Layout Enquiries",
        href: "/dashboard/explore-categories/layout-enquiries",
        icon: Map,
      },
      {
        name: "Manage Categories",
        href: "/dashboard/explore-categories/manage",
        icon: Layers,
      },
    ],
  },
  {
    name: "Services",
    icon: FileText,
    children: [
      {
        name: "Land Registration",
        href: "/dashboard/explore-categories/land-registrations",
        icon: FileText,
      },
      {
        name: "Legal Verification",
        href: "/dashboard/legal-verification",
        icon: Scale,
      },
      {
        name: "Loan Eligibility",
        href: "/dashboard/loan-eligibility",
        icon: Landmark,
      },
      {
        name: "Bank Partners",
        href: "/dashboard/loan-eligibility/bank-partners",
        icon: Landmark,
      },
    ],
  },
  {
    name: "Executive Management",
    icon: HardHat,
    children: [
      { name: "Add Executive", href: "/dashboard/executives/create", icon: PlusCircle },
      { name: "All Executives", href: "/dashboard/executives", icon: HardHat },
      { name: "Assigned Tasks", href: "/dashboard/inspection-lands", icon: Map },
      { name: "Site Visits", href: "/dashboard/land-visits", icon: Camera },
    ],
  },
  { name: "Leads", href: "/dashboard/enquiries", icon: MessageSquare },
  { name: "Listing Requests", href: "/dashboard/listing-requests", icon: FileText },
  {
    name: "Payments",
    icon: CreditCard,
    children: [
      {
        name: "Subscription Plans",
        href: "/dashboard/subscription-plans",
        icon: CreditCard,
      },
      {
        name: "Payment Transactions",
        href: "/dashboard/subscription-purchases",
        icon: Receipt,
      },
    ],
  },
  {
    name: "Marketing",
    icon: Megaphone,
    children: [
      { name: "Banners", href: "/dashboard/banners", icon: GalleryHorizontal },
    ],
  },
  { name: "Pincodes", href: "/dashboard/pincodes", icon: MapPin },
  { name: "Reports", href: "/dashboard/reports", icon: MessageSquare },
  { name: "Roles & Permissions", href: "/dashboard/sub-admins", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  const handleLogout = () => {
    logout();
    router.push("/login");
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

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isExpanded = openSections.includes(item.name);
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
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
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
                            "flex items-center gap-3 pl-11 pr-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            isChildPageActive
                              ? "bg-gray-100 text-[#1e2667]"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
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
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
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

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer mt-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
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
