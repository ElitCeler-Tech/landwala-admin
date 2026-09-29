"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * One back control for the whole dashboard, rendered by the layout rather
 * than repeated in each page. Most pages had none, so a reviewer who had
 * followed two or three links had no way back except the sidebar, which
 * returns to the top of a section rather than where they came from.
 *
 * Hidden on the dashboard root, which has nothing to go back to. Pages that
 * already draw their own back link are left alone, so they do not end up with
 * two.
 */
const PAGES_WITH_OWN_BACK_LINK = [
  "/dashboard/agents/",
  "/dashboard/users/",
  "/dashboard/executives/",
  "/dashboard/plots/",
  "/dashboard/layouts/",
  "/dashboard/reports/",
  "/dashboard/land-visits/",
  "/dashboard/inspection-lands/",
  "/dashboard/listing-requests/",
  "/dashboard/property-submissions/",
  "/dashboard/transactions/",
  "/dashboard/subscription-plans/",
  "/dashboard/explore-categories/",
];

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/dashboard") return null;

  // A page one level deep under a section that draws its own header link
  // already has a back control; anything at the section root does not.
  const drawsItsOwn = PAGES_WITH_OWN_BACK_LINK.some(
    (prefix) => pathname.startsWith(prefix) && pathname.length > prefix.length,
  );
  if (drawsItsOwn) return null;

  return (
    <div className="px-8 pt-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1e2667] transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
    </div>
  );
}
