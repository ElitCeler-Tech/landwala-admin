"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, Plus } from "lucide-react";
import Link from "next/link";
import {
  subscriptionPlansApi,
  SubscriptionPlan,
  PaginationMeta,
} from "@/lib/api";
import { Pagination } from "@/components/Pagination";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(9);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await subscriptionPlansApi.getSubscriptionPlans(
          currentPage,
          pageLimit,
        );
        setPlans(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [currentPage, pageLimit]);

  const getPlanUnit = (duration: number) => {
    if (duration === 1) return "/month";
    if (duration === 3 || duration === 4) return "/qtr";
    if (duration === 12) return "/year";
    return `/${duration}mo`;
  };

  const formatTitle = (title: string) => {
    return title.split(" ")[0]; // "Monthly Plan" -> "Monthly"
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-gray-50/50 font-sans min-h-full flex flex-col items-center">
      <div className="w-full flex-1 max-w-7xl mx-auto flex flex-col">
        <div className="mb-10 flex flex-wrap justify-between items-end gap-4 w-full">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Plans
            </h1>
            <p className="text-gray-500 max-w-2xl">
              Manage the subscription plans available for land protection and
              site visits.
            </p>
          </div>
          <Link href="/dashboard/subscription-plans/new">
            <button className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">No subscription plans found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="w-full max-w-[340px] bg-[#222222] rounded-2xl p-8 flex flex-col shadow-xl"
              >
                <div>
                  <h3 className="text-white text-2xl font-bold tracking-tight mb-1">
                    {formatTitle(plan.title)}
                  </h3>
                  <p className="text-[#6484A4] text-sm font-medium mb-8">
                    {plan.title.includes("Plan")
                      ? plan.title
                      : `${plan.title} Plan`}
                  </p>

                  <div className="flex items-baseline mb-8">
                    <span className="text-white text-[2.5rem] font-bold leading-none">
                      ₹{plan.price}
                    </span>
                    <span className="text-white text-lg ml-1 font-medium">
                      {getPlanUnit(plan.durationMonths)}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.description.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <Check
                          className="w-5 h-5 text-[#2B73EB] shrink-0"
                          strokeWidth={2.5}
                        />
                        <span className="text-[#C1C1C1] text-[15px] font-medium leading-tight">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
                  <Link href={`/dashboard/subscription-plans/${plan.id}`}>
                    <button className="w-full bg-[#595959] hover:bg-[#666666] active:scale-[0.98] text-[#f4f4f4] font-semibold py-3.5 px-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center">
                      Edit Plan
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {plans.length > 0 && (
          <div className="flex justify-center mt-10">
            <Pagination
              currentPage={currentPage}
              totalPages={meta?.totalPages || 1}
              onPageChange={setCurrentPage}
              totalItems={meta?.total ?? 0}
              pageSize={pageLimit}
              onPageSizeChange={(size) => {
                setPageLimit(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
