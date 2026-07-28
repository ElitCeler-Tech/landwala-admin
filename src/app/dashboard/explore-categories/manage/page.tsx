"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  exploreCategoryManagementApi,
  ExploreCategory,
  CreateExploreCategoryPayload,
} from "@/lib/api";

const EMPTY_FORM: CreateExploreCategoryPayload = {
  name: "",
  displayOrder: 0,
  isActive: true,
};

export default function ManageExploreCategoriesPage() {
  const [categories, setCategories] = useState<ExploreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateExploreCategoryPayload>(EMPTY_FORM);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await exploreCategoryManagementApi.getCategories(1, 100);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch explore categories:", err);
      setError("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: ExploreCategory) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
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
        await exploreCategoryManagementApi.updateCategory(editingId, form);
      } else {
        await exploreCategoryManagementApi.createCategory(form);
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error("Failed to save category:", err);
      setError("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    try {
      await exploreCategoryManagementApi.deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category");
    }
  };

  const handleToggleActive = async (category: ExploreCategory) => {
    try {
      await exploreCategoryManagementApi.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      await fetchCategories();
    } catch (err) {
      console.error("Failed to toggle category status:", err);
      setError("Failed to update category status");
    }
  };

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Link
          href="/dashboard/explore-categories"
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Link>
        <h1 className="text-2xl font-medium text-gray-900">
          Manage Explore Categories
        </h1>
      </div>
      <p className="text-gray-500 italic ml-8 mb-2">
        Admin-managed category list. Not yet consumed by the mobile app —
        the app&apos;s Explore screen still uses its own hardcoded list.
      </p>

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
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
        ) : categories.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No categories yet. Add one to get started.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="py-4 pl-6 rounded-l-xl font-medium text-gray-600">
                  Name
                </th>
                <th className="py-4 font-medium text-gray-600">Order</th>
                <th className="py-4 font-medium text-gray-600">Status</th>
                <th className="py-4 pr-6 rounded-r-xl font-medium text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600 divide-y divide-gray-50">
              {categories
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50">
                    <td className="py-4 pl-6 font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="py-4">{category.displayOrder}</td>
                    <td className="py-4">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
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
                  placeholder="e.g. Farmland"
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
                {editingId ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
