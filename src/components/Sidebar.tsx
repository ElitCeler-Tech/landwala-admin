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
  Eye,
  History,
  Flame,
  TrendingUp,
  Navigation,
  ShoppingCart,
  Handshake,
  Video,
  BookOpen,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import { AdminSection } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";

type SidebarItem = {
  name: string;
  href?: string;
  icon: LucideIcon;
  // The AdminSection this item (and its children, if any) is gated behind.
  // Omitted for items that are always visible (e.g. Dashboard).
  section?: AdminSection;
  children?: SidebarItem[];
};

export const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "User Management",
    icon: Users,
    section: "USER_MANAGEMENT",
    children: [{ name: "Users", href: "/dashboard/users", icon: Users }],
  },
  {
    name: "Agent Management",
    icon: UserCog,
    section: "AGENT_MANAGEMENT",
    children: [
      { name: "Agents", href: "/dashboard/agents", icon: UserCog },
      { name: "Commissions", href: "/dashboard/transactions", icon: Receipt },
    ],
  },
  {
    name: "Property Management",
    icon: Home,
    section: "PROPERTY_MANAGEMENT",
    children: [
      { name: "Add Property", href: "/dashboard/plots/create", icon: PlusCircle },
      { name: "All Properties", href: "/dashboard/plots", icon: Grid },
      { name: "Latest Listings", href: "/dashboard/latest-listings", icon: Home },
      { name: "Most Viewed", href: "/dashboard/most-viewed", icon: Eye },
      { name: "Recently Viewed", href: "/dashboard/recently-viewed", icon: History },
      { name: "Hot Sale", href: "/dashboard/hot-sale", icon: Flame },
      { name: "Trending", href: "/dashboard/trending", icon: TrendingUp },
      {
        name: "Near By Properties",
        href: "/dashboard/near-by-properties",
        icon: Navigation,
      },
      { name: "Layouts", href: "/dashboard/layouts", icon: Map },
      {
        name: "Layout Enquiries",
        href: "/dashboard/explore-categories/layout-enquiries",
        icon: MessageSquare,
      },
      { name: "Archived Properties", href: "/dashboard/plots/archived", icon: FileText },
    ],
  },
  {
    name: "Land Protection",
    icon: ShieldCheck,
    section: "LAND_PROTECTION",
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
      {
        name: "Videos",
        href: "/dashboard/explore-categories/land-protection/videos",
        icon: Video,
      },
    ],
  },
  {
    name: "Buy Plots / Enquiries",
    href: "/dashboard/explore-categories/buy-sell-plots",
    icon: ShoppingCart,
    section: "BUY_ENQUIRIES",
  },
  {
    name: "Sell Requests",
    href: "/dashboard/property-submissions",
    icon: Handshake,
    section: "SELL_REQUESTS",
  },
  {
    name: "Services",
    icon: FileText,
    section: "SERVICES",
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
    section: "EXECUTIVE_MANAGEMENT",
    children: [
      { name: "Add Executive", href: "/dashboard/executives/create", icon: PlusCircle },
      { name: "All Executives", href: "/dashboard/executives", icon: HardHat },
      { name: "Assigned Tasks", href: "/dashboard/inspection-lands", icon: Map },
      { name: "Site Visits", href: "/dashboard/land-visits", icon: Camera },
    ],
  },
  {
    name: "Leads",
    href: "/dashboard/enquiries",
    icon: MessageSquare,
    section: "LEADS",
  },
  {
    name: "Agent Listing Properties",
    href: "/dashboard/listing-requests",
    icon: FileText,
    section: "LISTING_REQUESTS",
  },
  {
    name: "Payments",
    icon: CreditCard,
    section: "PAYMENTS",
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
    section: "MARKETING",
    children: [
      { name: "Banners", href: "/dashboard/banners", icon: GalleryHorizontal },
    ],
  },
  {
    name: "Content",
    href: "/dashboard/content",
    icon: BookOpen,
    section: "CONTENT_MANAGEMENT",
  },
  {
    name: "Pincodes",
    href: "/dashboard/pincodes",
    icon: MapPin,
    section: "PINCODES",
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: MessageSquare,
    section: "REPORTS",
  },
  {
    name: "Roles & Permissions",
    href: "/dashboard/sub-admins",
    icon: ShieldCheck,
    section: "ROLES_PERMISSIONS",
  },
];

// Resolves the AdminSection that gates a given pathname, by finding the
// most specific (longest) matching href among all sidebar items/children.
// Returns null for unmapped routes (e.g. /dashboard itself, or account
// pages like /dashboard/profile) — null means "not section-gated".
// Shared by the Sidebar (to decide what to render) and the dashboard route
// guard (to decide what to allow), so the two can never drift out of sync.
export function getSectionForPathname(pathname: string): AdminSection | null {
  let bestHref = "";
  let bestSection: AdminSection | null = null;

  const consider = (href: string | undefined, section: AdminSection | undefined) => {
    if (!href || href === "/dashboard") return;
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (!matches) return;
    if (href.length > bestHref.length) {
      bestHref = href;
      bestSection = section ?? null;
    }
  };

  for (const item of sidebarItems) {
    consider(item.href, item.section);
    item.children?.forEach((child) => consider(child.href, item.section));
  }

  return bestSection;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasSection } = useAuthStore();

  // Only render the items (and their groups) the logged-in admin actually
  // has access to. Dashboard (no `section`) is always visible; everything
  // else is gated by the section granted to this admin (SUPER_ADMIN/ADMIN
  // bypass this via hasSection() itself).
  // `user` (not just `hasSection`) is the real trigger for recomputation:
  // hasSection is a stable function reference that reads the store's
  // current user internally, so `user` must stay in the dep array for
  // recompute-on-login even though the linter can't see that indirection.
  const visibleSidebarItems = useMemo(
    () => sidebarItems.filter((item) => !item.section || hasSection(item.section)),
    [hasSection, user], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Finds the collapsible section (if any) whose children contain the
  // currently-active route, so it can be auto-expanded.
  const findActiveSectionName = (path: string) => {
    const activeItem = visibleSidebarItems.find((item) =>
      item.children?.some((child) =>
        child.href
          ? child.href === "/dashboard"
            ? path === "/dashboard"
            : path.startsWith(child.href)
          : false,
      ),
    );
    return activeItem?.name ?? null;
  };

  // Single-open accordion: only one section can be expanded at a time.
  const [openSection, setOpenSection] = useState<string | null>(() =>
    findActiveSectionName(pathname),
  );

  // Whenever the route changes, collapse whichever section was open and
  // auto-expand the section (if any) that contains the new active route.
  // This follows React's documented "adjust state during render" pattern
  // (rather than an effect) so the accordion state and the just-rendered
  // route never visibly disagree for a frame.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenSection(findActiveSectionName(pathname));
  }

  // Refs to each collapsible section's wrapper element, keyed by section
  // name, so the newly-opened section can be scrolled into view within the
  // nav's own scroll container (whether opened by hand or auto-expanded by
  // a route change) instead of leaving its children hidden below the fold.
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!openSection) return;
    const el = sectionRefs.current[openSection];
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [openSection]);

  const userName = user?.name || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  const toggleSection = (name: string) => {
    setOpenSection((prev) => (prev === name ? null : name));
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
        {visibleSidebarItems.map((item) => {
          const isExpanded = openSection === item.name;
          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            const isChildActive = item.children?.some(
              (child) =>
                pathname === child.href || pathname.startsWith(child.href!),
            );

            return (
              <div
                key={item.name}
                ref={(el) => {
                  sectionRefs.current[item.name] = el;
                }}
              >
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
