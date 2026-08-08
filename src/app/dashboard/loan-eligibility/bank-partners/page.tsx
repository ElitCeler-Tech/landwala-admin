"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  bankPartnersApi,
  BankPartner,
  CreateBankPartnerPayload,
} from "@/lib/api";
import { Pagination } from "@/components/Pagination";

const EMPTY_FORM: CreateBankPartnerPayload = {
  name: "",
  contactEmail: "",
  contactPhone: "",
  interestInfo: "",
  displayOrder: 0,
  isActive: true,
};

// The bank partner directory is a small, hand-curated list (a handful of
// partner banks), so rather than round-tripping to the paginated backend
// endpoint on every page click, we fetch the full list once and paginate
// client-side -- same approach as the Top Agents page.

export default function BankPartnersPage() {
  const [partners, setPartners] = useState<BankPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBankPartnerPayload>(EMPTY_FORM);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const response = await bankPartnersApi.getPartners(1, 100);
      setPartners(response.data);
    } catch (err) {
      console.error("Failed to fetch bank partners:", err);
      setError("Failed to load bank partners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const sortedPartners = useMemo(
    () => partners.slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [partners],
  );
  const totalPages = Math.max(
    Math.ceil(sortedPartners.length / pageLimit),
    1,
  );
  const pagedPartners = useMemo(
    () =>
      sortedPartners.slice(
        (currentPage - 1) * pageLimit,
        currentPage * pageLimit,
      ),
    [sortedPartners, currentPage, pageLimit],
  );

  // Keep the current page in range if the list shrinks (e.g. after a delete).
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (partner: BankPartner) => {
    setEditingId(partner.id);
    setForm({
      name: partner.name,
      contactEmail: partner.contactEmail || "",
      contactPhone: partner.contactPhone || "",
      interestInfo: partner.interestInfo || "",
      displayOrder: partner.displayOrder,
      isActive: partner.isActive,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await bankPartnersApi.updatePartner(editingId, form);
      } else {
        await bankPartnersApi.createPartner(form);
      }
      setIsModalOpen(false);
      await fetchPartners();
    } catch (err) {
      console.error("Failed to save bank partner:", err);
      setError("Failed to save bank partner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bank partner? This cannot be undone.")) return;
    try {
      await bankPartnersApi.deletePartner(id);
      await fetchPartners();
    } catch (err) {
      console.error("Failed to delete bank partner:", err);
      setError("Failed to delete bank partner");
    }
  };

  const handleToggleActive = async (partner: BankPartner) => {
    try {
      await bankPartnersApi.updatePartner(partner.id, {
        isActive: !partner.isActive,
      });
      await fetchPartners();
    } catch (err) {
      console.error("Failed to toggle bank partner status:", err);
      setError("Failed to update bank partner status");
    }
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/dashboard/loan-eligibility"
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-2xl font-medium text-gray-900">Bank Partners</h1>
      </div>
      <p className="text-gray-500 italic ml-8 mb-2">
        Manage the bank partner directory shown under Loan Eligibility.
      </p>

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Bank Partner
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
          </div>
        ) : partners.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No bank partners yet. Add one to get started.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                  Name
                </th>
                <th className="py-4 font-medium text-gray-600">Contact</th>
                <th className="py-4 font-medium text-gray-600">
                  Interest Info
                </th>
                <th className="py-4 font-medium text-gray-600">Status</th>
                <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
              {pagedPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50/50">
                    <td className="py-4 pl-6 font-medium text-gray-900">
                      {partner.name}
                    </td>
                    <td className="py-4">
                      {partner.contactPhone || partner.contactEmail || "—"}
                    </td>
                    <td className="py-4 max-w-xs truncate">
                      {partner.interestInfo || "—"}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleActive(partner)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer ${
                          partner.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {partner.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && sortedPartners.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedPartners.length}
            pageSize={pageLimit}
            onPageSizeChange={(size) => {
              setPageLimit(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Bank Partner" : "Add Bank Partner"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm({ ...form, contactPhone: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Interest Rate / Offer Info
                </label>
                <textarea
                  value={form.interestInfo}
                  onChange={(e) =>
                    setForm({ ...form, interestInfo: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. Starting at 8.5% p.a."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      displayOrder: Number(e.target.value),
                    })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create Bank Partner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
