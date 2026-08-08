"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  subscriptionPurchasesApi,
  SubscriptionPurchase,
  genericPaymentsApi,
  GenericPayment,
} from "@/lib/api";
import { Pagination } from "@/components/Pagination";

const SUBSCRIPTION_STATUS_FILTERS = ["all", "ACTIVE", "PAID", "EXPIRED", "TERMINATED"];
const GENERIC_STATUS_FILTERS = ["all", "ACTIVE", "PAID", "EXPIRED", "FAILED"];
const PAYMENT_TYPES = ["Subscription Plans", "Other Payments"] as const;
type PaymentType = (typeof PAYMENT_TYPES)[number];

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: string) {
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-blue-100 text-blue-700",
    PAID: "bg-green-100 text-green-700",
    EXPIRED: "bg-gray-100 text-gray-700",
    TERMINATED: "bg-red-100 text-red-700",
    FAILED: "bg-red-100 text-red-700",
  };
  return statusStyles[status] || "bg-gray-100 text-gray-700";
}

export default function SubscriptionPurchasesPage() {
  const [paymentType, setPaymentType] = useState<PaymentType>(
    "Subscription Plans",
  );

  // Subscription plan purchases
  const [purchases, setPurchases] = useState<SubscriptionPurchase[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [subStatusFilter, setSubStatusFilter] = useState("all");

  // Generic payments
  const [payments, setPayments] = useState<GenericPayment[]>([]);
  const [genTotal, setGenTotal] = useState(0);
  const [genTotalPages, setGenTotalPages] = useState(1);
  const [genPage, setGenPage] = useState(1);
  const [genStatusFilter, setGenStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (paymentType !== "Subscription Plans") return;
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const response = await subscriptionPurchasesApi.getAllPurchases(
          subPage,
          limit,
          subStatusFilter === "all" ? undefined : subStatusFilter,
        );
        setPurchases(response.data);
        setSubTotal(response.meta.total);
        setSubTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch subscription purchases:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [paymentType, subPage, limit, subStatusFilter]);

  useEffect(() => {
    if (paymentType !== "Other Payments") return;
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const response = await genericPaymentsApi.getAllPayments(
          genPage,
          limit,
          genStatusFilter === "all" ? undefined : genStatusFilter,
        );
        setPayments(response.data);
        setGenTotal(response.meta.total);
        setGenTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [paymentType, genPage, limit, genStatusFilter]);

  const filteredPurchases = purchases.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.user.name || "").toLowerCase().includes(query) ||
      (p.user.email || "").toLowerCase().includes(query) ||
      (p.user.phone || "").includes(searchQuery) ||
      p.cfOrderId.toLowerCase().includes(query) ||
      p.plan.title.toLowerCase().includes(query)
    );
  });

  const filteredPayments = payments.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.user.name || "").toLowerCase().includes(query) ||
      (p.user.email || "").toLowerCase().includes(query) ||
      (p.user.phone || "").includes(searchQuery) ||
      p.cfOrderId.toLowerCase().includes(query) ||
      (p.note || "").toLowerCase().includes(query)
    );
  });

  const isSubTab = paymentType === "Subscription Plans";
  const total = isSubTab ? subTotal : genTotal;
  const totalPages = isSubTab ? subTotalPages : genTotalPages;
  const currentPage = isSubTab ? subPage : genPage;
  const setCurrentPage = isSubTab ? setSubPage : setGenPage;

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Payment Transactions
          </h1>
          <p className="text-gray-500 italic">
            Subscription plan purchases and other payments across all users
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search user, order ID, or plan"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {PAYMENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => {
              setPaymentType(type);
              setSearchQuery("");
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              paymentType === type
                ? "bg-[#1e2667] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(isSubTab ? SUBSCRIPTION_STATUS_FILTERS : GENERIC_STATUS_FILTERS).map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                if (isSubTab) {
                  setSubStatusFilter(status);
                  setSubPage(1);
                } else {
                  setGenStatusFilter(status);
                  setGenPage(1);
                }
              }}
              className={`text-sm font-medium px-4 py-2 rounded-lg capitalize transition-colors cursor-pointer ${
                (isSubTab ? subStatusFilter : genStatusFilter) === status
                  ? "bg-[#1e2667] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.toLowerCase()}
            </button>
          ),
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : isSubTab ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                    User
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Plan
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[10%]">
                    Amount
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[18%]">
                    Order ID
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[12%]">
                    Purchased
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[15%]">
                    Subscription Ends
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[10%]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {filteredPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {purchase.user.name || "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {purchase.user.email || purchase.user.phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-gray-900">
                      {purchase.plan.title}
                    </td>
                    <td className="py-5 text-gray-900">
                      ₹{purchase.plan.price}
                    </td>
                    <td className="py-5 text-gray-500 font-mono text-xs">
                      {purchase.cfOrderId}
                    </td>
                    <td className="py-5 text-gray-500">
                      {formatDate(purchase.createdAt)}
                    </td>
                    <td className="py-5 text-gray-500">
                      {formatDate(purchase.subscriptionEndsAt)}
                    </td>
                    <td className="py-5 pr-8">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                          purchase.orderStatus,
                        )}`}
                      >
                        {purchase.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No subscription purchases found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#f8f9fc]">
                  <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                    User
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[25%]">
                    Note
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[12%]">
                    Amount
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[20%]">
                    Order ID
                  </th>
                  <th className="py-4 font-medium text-gray-600 w-[13%]">
                    Date
                  </th>
                  <th className="py-4 pr-8 rounded-r-xl font-medium text-gray-600 w-[10%]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                <tr>
                  <td className="h-4"></td>
                </tr>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <td className="py-5 pl-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {payment.user.name || "-"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {payment.user.email || payment.user.phone || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-gray-900">
                      {payment.note || "-"}
                    </td>
                    <td className="py-5 text-gray-900">
                      {payment.currency} {payment.amount}
                    </td>
                    <td className="py-5 text-gray-500 font-mono text-xs">
                      {payment.cfOrderId}
                    </td>
                    <td className="py-5 text-gray-500">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-5 pr-8">
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusBadge(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-6 mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={total}
          pageSize={limit}
          onPageSizeChange={(size) => {
            setLimit(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
