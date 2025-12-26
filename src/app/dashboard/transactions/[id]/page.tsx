"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CommissionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-8 pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/transactions"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-medium text-gray-900">
            Commission Detailed screen-Assignment ID: CM-2025-1834
          </h1>
        </div>
        <p className="text-gray-500 italic ml-9">
          View all the details about the Commission here
        </p>
      </div>

      {/* Agent Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          Agent Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Name:</p>
            <p className="text-gray-900 font-medium text-base">Suresh B.</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Phone:</p>
            <p className="text-gray-900 font-medium text-base">9075689277</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Email Id</p>
            <p className="text-gray-900 font-medium text-base">
              suresh@yahoo.in
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Agent ID:</p>
            <p className="text-gray-900 font-medium text-base">AGT-02498</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Total Commission Assigned:
            </p>
            <p className="text-gray-900 font-medium text-base">₹ 20,000</p>
          </div>
        </div>
      </div>

      {/* Assignment Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
          Assignment Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-8">
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Property Name:
            </p>
            <p className="text-gray-900 font-medium text-base">
              Shivaji Layout – Phase 2
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Size:</p>
            <p className="text-gray-900 font-medium text-base">1200 sqft</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Assigned By:
            </p>
            <p className="text-gray-900 font-medium text-base">Andrew (Admin)</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">
              Date Assigned:
            </p>
            <p className="text-gray-900 font-medium text-base">
              09 Dec 2025, 01:14 PM
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2 font-medium">Status:</p>
            <p className="text-gray-900 font-medium text-base">Active</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <Link href="/dashboard/transactions">
          <button className="px-10 py-2.5 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer text-sm">
            Cancel
          </button>
        </Link>
        <button className="px-6 py-2.5 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer text-sm">
          Revoke Assignment
        </button>
      </div>
    </div>
  );
}
