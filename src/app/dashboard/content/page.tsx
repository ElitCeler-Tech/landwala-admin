"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from "lucide-react";
import {
  contentApi,
  LegalDocumentType,
  LegalDocumentSection,
  FaqItem,
  WhyChooseItem,
  WHY_CHOOSE_ICONS,
  FilterOption,
  FILTER_OPTION_GROUPS,
  FILTER_OPTION_GROUP_LABELS,
} from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

const TABS = [
  "Terms of Use",
  "Privacy Policy",
  "FAQs",
  "Why Choose Us",
  "Search Filters",
] as const;
type Tab = (typeof TABS)[number];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Terms of Use");

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      <h1 className="text-2xl font-medium text-gray-900 mb-2">
        Content Management
      </h1>
      <p className="text-gray-500 italic mb-6">
        Manage Terms of Use, Privacy Policy, FAQs, Why Choose Us content, and
        search filter options shown in the user app.
      </p>

      <div className="flex gap-2 border-b border-gray-100 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium cursor-pointer border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#1e2667] text-[#1e2667]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Terms of Use" && <LegalDocumentTab documentType="TERMS" />}
      {activeTab === "Privacy Policy" && (
        <LegalDocumentTab documentType="PRIVACY" />
      )}
      {activeTab === "FAQs" && <FaqTab />}
      {activeTab === "Why Choose Us" && <WhyChooseTab />}
      {activeTab === "Search Filters" && <FilterOptionsTab />}
    </div>
  );
}

// ===================== Terms / Privacy =====================

function LegalDocumentTab({ documentType }: { documentType: LegalDocumentType }) {
  const [sections, setSections] = useState<LegalDocumentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const data = await contentApi.getLegalSections(documentType);
      setSections(data.sections);
    } catch (err) {
      console.error("Failed to fetch legal sections:", err);
      setError("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ title: "", content: "" });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (section: LegalDocumentSection) => {
    setEditingId(section.id);
    setForm({ title: section.title, content: section.content });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await contentApi.updateLegalSection(editingId, form);
      } else {
        await contentApi.createLegalSection({
          documentType,
          title: form.title,
          content: form.content,
          displayOrder: sections.length,
        });
      }
      setIsModalOpen(false);
      await fetchSections();
    } catch (err) {
      console.error("Failed to save section:", err);
      setError("Failed to save section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section? This cannot be undone.")) return;
    try {
      await contentApi.deleteLegalSection(id);
      await fetchSections();
    } catch (err) {
      console.error("Failed to delete section:", err);
      setError("Failed to delete section");
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const a = sections[index];
    const b = sections[targetIndex];
    try {
      await Promise.all([
        contentApi.updateLegalSection(a.id, { displayOrder: b.displayOrder }),
        contentApi.updateLegalSection(b.id, { displayOrder: a.displayOrder }),
      ]);
      await fetchSections();
    } catch (err) {
      console.error("Failed to reorder sections:", err);
      setError("Failed to reorder sections");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Section
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
        ) : sections.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No sections yet. Add one to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {sections.map((section, index) => (
              <div key={section.id} className="py-4 flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleReorder(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-[#1e2667] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, "down")}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-[#1e2667] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{section.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(section)}
                    className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Section" : "Add Section"}
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
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. 1. Introduction"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Content
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
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
                {editingId ? "Save Changes" : "Create Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== FAQs =====================

function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: "", question: "", answer: "" });
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await contentApi.getFaqs();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
      setError("Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))),
    [items],
  );
  const filteredItems = useMemo(
    () =>
      categoryFilter === "All"
        ? items
        : items.filter((i) => i.category === categoryFilter),
    [items, categoryFilter],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      category: categoryFilter !== "All" ? categoryFilter : "",
      question: "",
      answer: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: FaqItem) => {
    setEditingId(item.id);
    setForm({ category: item.category, question: item.question, answer: item.answer });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.category.trim() || !form.question.trim() || !form.answer.trim()) {
      setError("Category, question, and answer are required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await contentApi.updateFaq(editingId, form);
      } else {
        await contentApi.createFaq({
          ...form,
          displayOrder: items.length,
        });
      }
      setIsModalOpen(false);
      await fetchItems();
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      setError("Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ? This cannot be undone.")) return;
    try {
      await contentApi.deleteFaq(id);
      await fetchItems();
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
      setError("Failed to delete FAQ");
    }
  };

  const handleReorder = async (item: FaqItem, direction: "up" | "down") => {
    const siblings = items
      .filter((i) => i.category === item.category)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const other = siblings[targetIndex];
    try {
      await Promise.all([
        contentApi.updateFaq(item.id, { displayOrder: other.displayOrder }),
        contentApi.updateFaq(other.id, { displayOrder: item.displayOrder }),
      ]);
      await fetchItems();
    } catch (err) {
      console.error("Failed to reorder FAQs:", err);
      setError("Failed to reorder FAQs");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <select
          onFocus={scrollSelectIntoView}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
        >
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
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
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No FAQs yet. Add one to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <div key={item.id} className="py-4 flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleReorder(item, "up")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(item, "down")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-1">
                    {item.category}
                  </span>
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.answer}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit FAQ" : "Add FAQ"}
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
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. Buyer, Seller, Buy Properties"
                  list="faq-categories"
                />
                <datalist id="faq-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Answer
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
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
                {editingId ? "Save Changes" : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== Why Choose Us =====================

function WhyChooseTab() {
  const [items, setItems] = useState<WhyChooseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sectionTitle: "",
    icon: WHY_CHOOSE_ICONS[0] as string,
    title: "",
    description: "",
  });
  const [sectionFilter, setSectionFilter] = useState("All");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await contentApi.getWhyChooseItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch Why Choose Us items:", err);
      setError("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sections = useMemo(
    () => Array.from(new Set(items.map((i) => i.sectionTitle))),
    [items],
  );
  const filteredItems = useMemo(
    () =>
      sectionFilter === "All"
        ? items
        : items.filter((i) => i.sectionTitle === sectionFilter),
    [items, sectionFilter],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      sectionTitle: sectionFilter !== "All" ? sectionFilter : "",
      icon: WHY_CHOOSE_ICONS[0],
      title: "",
      description: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: WhyChooseItem) => {
    setEditingId(item.id);
    setForm({
      sectionTitle: item.sectionTitle,
      icon: item.icon,
      title: item.title,
      description: item.description,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.sectionTitle.trim() || !form.title.trim() || !form.description.trim()) {
      setError("Section, title, and description are required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editingId) {
        await contentApi.updateWhyChooseItem(editingId, form);
      } else {
        await contentApi.createWhyChooseItem({
          ...form,
          displayOrder: items.length,
        });
      }
      setIsModalOpen(false);
      await fetchItems();
    } catch (err) {
      console.error("Failed to save item:", err);
      setError("Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      await contentApi.deleteWhyChooseItem(id);
      await fetchItems();
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete item");
    }
  };

  const handleReorder = async (item: WhyChooseItem, direction: "up" | "down") => {
    const siblings = items
      .filter((i) => i.sectionTitle === item.sectionTitle)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const other = siblings[targetIndex];
    try {
      await Promise.all([
        contentApi.updateWhyChooseItem(item.id, { displayOrder: other.displayOrder }),
        contentApi.updateWhyChooseItem(other.id, { displayOrder: item.displayOrder }),
      ]);
      await fetchItems();
    } catch (err) {
      console.error("Failed to reorder items:", err);
      setError("Failed to reorder items");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <select
          onFocus={scrollSelectIntoView}
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] max-w-xs"
        >
          <option value="All">All sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Item
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
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No items yet. Add one to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <div key={item.id} className="py-4 flex items-start gap-4">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    onClick={() => handleReorder(item, "up")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(item, "down")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-1">
                    {item.sectionTitle}
                  </span>
                  <p className="font-medium text-gray-900">
                    {item.title}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      ({item.icon})
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Item" : "Add Item"}
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
                  Section Title
                </label>
                <input
                  type="text"
                  value={form.sectionTitle}
                  onChange={(e) =>
                    setForm({ ...form, sectionTitle: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. Why Choose Our Land Protection Services"
                  list="why-choose-sections"
                />
                <datalist id="why-choose-sections">
                  {sections.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Icon
                </label>
                <select
                  onFocus={scrollSelectIntoView}
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                >
                  {WHY_CHOOSE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                />
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
                {editingId ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== Search Filter Options =====================

function FilterOptionsTab() {
  const [items, setItems] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    groupKey: FILTER_OPTION_GROUPS[0] as string,
    value: "",
    minValue: "",
    maxValue: "",
  });
  const [groupFilter, setGroupFilter] = useState<string>("All");

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await contentApi.getFilterOptions();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
      setError("Failed to load filter options");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(
    () =>
      groupFilter === "All"
        ? items
        : items.filter((i) => i.groupKey === groupFilter),
    [items, groupFilter],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      groupKey: groupFilter !== "All" ? groupFilter : FILTER_OPTION_GROUPS[0],
      value: "",
      minValue: "",
      maxValue: "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: FilterOption) => {
    setEditingId(item.id);
    setForm({
      groupKey: item.groupKey,
      value: item.value,
      minValue: item.minValue?.toString() ?? "",
      maxValue: item.maxValue?.toString() ?? "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.value.trim()) {
      setError("Value is required");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        groupKey: form.groupKey,
        value: form.value,
        minValue: form.minValue.trim() ? Number(form.minValue) : undefined,
        maxValue: form.maxValue.trim() ? Number(form.maxValue) : undefined,
      };
      if (editingId) {
        await contentApi.updateFilterOption(editingId, payload);
      } else {
        const siblingCount = items.filter(
          (i) => i.groupKey === form.groupKey,
        ).length;
        await contentApi.createFilterOption({
          ...payload,
          displayOrder: siblingCount,
        });
      }
      setIsModalOpen(false);
      await fetchItems();
    } catch (err) {
      console.error("Failed to save filter option:", err);
      setError("Failed to save filter option");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this option? This cannot be undone.")) return;
    try {
      await contentApi.deleteFilterOption(id);
      await fetchItems();
    } catch (err) {
      console.error("Failed to delete filter option:", err);
      setError("Failed to delete filter option");
    }
  };

  const handleReorder = async (item: FilterOption, direction: "up" | "down") => {
    const siblings = items
      .filter((i) => i.groupKey === item.groupKey)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const index = siblings.findIndex((i) => i.id === item.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    const other = siblings[targetIndex];
    try {
      await Promise.all([
        contentApi.updateFilterOption(item.id, { displayOrder: other.displayOrder }),
        contentApi.updateFilterOption(other.id, { displayOrder: item.displayOrder }),
      ]);
      await fetchItems();
    } catch (err) {
      console.error("Failed to reorder filter options:", err);
      setError("Failed to reorder filter options");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <select
          onFocus={scrollSelectIntoView}
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667] max-w-xs"
        >
          <option value="All">All groups</option>
          {FILTER_OPTION_GROUPS.map((g) => (
            <option key={g} value={g}>
              {FILTER_OPTION_GROUP_LABELS[g]}
            </option>
          ))}
        </select>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#1e2667] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-opacity cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Option
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
        ) : filteredItems.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No options yet. Add one to get started.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleReorder(item, "up")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(item, "down")}
                    className="p-1 text-gray-400 hover:text-[#1e2667] cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mb-1">
                    {FILTER_OPTION_GROUP_LABELS[
                      item.groupKey as (typeof FILTER_OPTION_GROUPS)[number]
                    ] ?? item.groupKey}
                  </span>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-gray-500 hover:text-[#1e2667] hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingId ? "Edit Option" : "Add Option"}
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
                  Group
                </label>
                <select
                  onFocus={scrollSelectIntoView}
                  value={form.groupKey}
                  onChange={(e) => setForm({ ...form, groupKey: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                >
                  {FILTER_OPTION_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {FILTER_OPTION_GROUP_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                  placeholder="e.g. 2 BHK"
                />
              </div>
              {form.groupKey === "price_range" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Min Price (&#8377;)
                    </label>
                    <input
                      type="number"
                      value={form.minValue}
                      onChange={(e) =>
                        setForm({ ...form, minValue: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                      placeholder="Leave blank for unbounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Max Price (&#8377;)
                    </label>
                    <input
                      type="number"
                      value={form.maxValue}
                      onChange={(e) =>
                        setForm({ ...form, maxValue: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1e2667]"
                      placeholder="Leave blank for unbounded"
                    />
                  </div>
                  <p className="col-span-2 text-xs text-gray-400">
                    These are the actual price filter values applied when a
                    user selects this range -- not just display text.
                  </p>
                </div>
              )}
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
                {editingId ? "Save Changes" : "Create Option"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
