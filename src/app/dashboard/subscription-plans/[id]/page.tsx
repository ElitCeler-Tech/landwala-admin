"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Plus, X, Trash2, Check } from "lucide-react";
import Link from "next/link";
import { subscriptionPlansApi, CreateSubscriptionPlanPayload } from "@/lib/api";

export default function SubscriptionPlanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  const isNew = planId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateSubscriptionPlanPayload>({
    title: "",
    price: 0,
    durationMonths: 1,
    isActive: true,
    description: [""],
  });

  useEffect(() => {
    if (isNew) return;

    const fetchPlan = async () => {
      try {
        // Find the specific plan. The API returns an object with { data: SubscriptionPlan }
        const response =
          await subscriptionPlansApi.getSubscriptionPlanById(planId);
        if (response.data) {
          setFormData({
            title: response.data.title,
            price: response.data.price,
            durationMonths: response.data.durationMonths,
            isActive: response.data.isActive,
            description:
              response.data.description?.length > 0
                ? response.data.description
                : [""],
          });
        }
      } catch (err) {
        console.error("Failed to fetch plan:", err);
        setError("Failed to load plan details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId, isNew]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDesc = [...formData.description];
    newDesc[index] = value;
    setFormData({ ...formData, description: newDesc });
  };

  const addDescriptionField = () => {
    setFormData({ ...formData, description: [...formData.description, ""] });
  };

  const removeDescriptionField = (index: number) => {
    if (formData.description.length <= 1) return;
    const newDesc = formData.description.filter((_, i) => i !== index);
    setFormData({ ...formData, description: newDesc });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      // Filter out empty descriptions
      const cleanedData = {
        ...formData,
        description: formData.description.filter((d) => d.trim() !== ""),
      };

      if (isNew) {
        await subscriptionPlansApi.createSubscriptionPlan(cleanedData);
      } else {
        await subscriptionPlansApi.updateSubscriptionPlan(planId, cleanedData);
      }

      router.push("/dashboard/subscription-plans");
    } catch (err: any) {
      console.error("Error saving plan:", err);
      setError(
        err.response?.data?.message ||
          "Something went wrong while saving the plan.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this subscription plan?"))
      return;

    setIsDeleting(true);
    try {
      await subscriptionPlansApi.deleteSubscriptionPlan(planId);
      router.push("/dashboard/subscription-plans");
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      setError(err.response?.data?.message || "Failed to delete plan.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50/50 font-sans min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-4 bg-gray-50/50 font-sans min-h-full flex flex-col">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/subscription-plans">
              <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? "Create Subscription Plan" : "Edit Subscription Plan"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isNew
                  ? "Add a new plan offering"
                  : "Modify existing plan details and features"}
              </p>
            </div>
          </div>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer text-sm border border-red-100"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Plan
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {/* Form Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Plan Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Basic Plan"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 999"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Duration (Months)
                </label>
                <div className="relative">
                  <select
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleInputChange}
                    className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all text-gray-900 bg-white"
                  >
                    <option value={1}>1 Month (Monthly)</option>
                    <option value={3}>3 Months (Quarterly)</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months (Half-Yearly)</option>
                    <option value={12}>12 Months (Yearly)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex items-center h-full pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-[#1e2667]/20 peer-checked:bg-[#1e2667] transition-colors"></div>
                    <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Active Status
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Plan Features
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    List the features included in this plan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDescriptionField}
                  className="flex items-center gap-1.5 text-sm bg-indigo-50 text-[#1e2667] font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>

              <div className="space-y-3">
                {formData.description.map((desc, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Check
                          className="w-4 h-4 text-[#2B73EB]"
                          strokeWidth={3}
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={desc}
                        onChange={(e) =>
                          handleDescriptionChange(index, e.target.value)
                        }
                        placeholder="e.g. Regular Visit once a week"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all text-gray-900"
                      />
                    </div>
                    {formData.description.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDescriptionField(index)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-4">
              <Link href="/dashboard/subscription-plans" className="flex-1">
                <button
                  type="button"
                  className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3.5 px-4 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex-1 bg-[#1e2667] text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-[#151b4d] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
                {isNew ? "Create Plan" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
