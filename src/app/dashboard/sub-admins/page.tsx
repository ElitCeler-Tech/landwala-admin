"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { subAdminsApi, SubAdmin, PaginationMeta } from "@/lib/api";

export default function SubAdminsPage() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  // Modal styling and setup
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [] as string[],
  });

  const PERMISSION_OPTIONS = ["VIEW", "CREATE", "UPDATE", "DELETE"];

  const fetchSubAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await subAdminsApi.getSubAdmins(currentPage, limit);
      setSubAdmins(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Failed to fetch sub-admins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permission);
      if (isSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== permission),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission],
        };
      }
    });
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await subAdminsApi.createSubAdmin(formData);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", permissions: [] });
      // Refresh the list seamlessly
      fetchSubAdmins();
    } catch (error) {
      console.error("Failed to create sub-admin:", error);
      alert("Error: Could not create sub admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubAdmins = subAdmins.filter((admin) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading && subAdmins.length === 0) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">
            Sub Admins
          </h1>
          <p className="text-gray-500 italic">
            Manage administrative access and permissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-[#1e2667] text-gray-900 text-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Sub Admin
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc] text-sm">
                <th className="py-4 pl-8 rounded-l-xl font-medium text-gray-600 w-[20%]">
                  Admin Details
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">Role</th>
                <th className="py-4 font-medium text-gray-600 w-[25%]">
                  Permissions
                </th>
                <th className="py-4 font-medium text-gray-600 w-[10%]">
                  Status
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%]">
                  Last Login
                </th>
                <th className="py-4 font-medium text-gray-600 w-[15%] rounded-r-xl pr-8">
                  Created On
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              <tr>
                <td className="h-4"></td>
              </tr>
              {filteredSubAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <td className="py-5 pl-8">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {admin.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {admin.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-md">
                      {admin.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-5">
                    <div className="flex flex-wrap gap-1">
                      {admin.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] uppercase font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-5 text-gray-500">
                    {admin.lastLoginAt
                      ? new Date(admin.lastLoginAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "Never"}
                  </td>
                  <td className="py-5 text-gray-500 pr-8">
                    {new Date(admin.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {filteredSubAdmins.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No sub-admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between mb-6 items-center mt-6">
        <span className="text-gray-500 text-sm">
          Showing{" "}
          {meta
            ? `${(currentPage - 1) * limit + 1}-${Math.min(
                currentPage * limit,
                meta.total,
              )} of ${meta.total}`
            : "0"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!meta?.hasPrevPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!meta?.hasNextPage}
            className="p-2 bg-[#1e2667] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CREATE SUB ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Sub Admin
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2667]/20 focus:border-[#1e2667] outline-none transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2667]/20 focus:border-[#1e2667] outline-none transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="e.g. SecurePass123!"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2667]/20 focus:border-[#1e2667] outline-none transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PERMISSION_OPTIONS.map((perm) => (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.permissions.includes(perm)
                          ? "border-[#1e2667] bg-indigo-50/50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => handlePermissionToggle(perm)}
                        className="w-4 h-4 text-[#1e2667] rounded border-gray-300 focus:ring-[#1e2667]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {perm}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.permissions.length === 0}
                  className="flex-1 px-4 py-2 bg-[#1e2667] text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
