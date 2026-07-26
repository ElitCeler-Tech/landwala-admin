"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle } from "lucide-react";
import { executivesApi } from "@/lib/api";

interface ExecutiveFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  assignedDistrict: string;
  assignedMandal: string;
  assignedVillage: string;
}

export default function CreateExecutivePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ExecutiveFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    assignedDistrict: "",
    assignedMandal: "",
    assignedVillage: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await executivesApi.createExecutive({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender || undefined,
        assignedDistrict: formData.assignedDistrict,
        assignedMandal: formData.assignedMandal,
        assignedVillage: formData.assignedVillage,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/executives");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create executive");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Executive Created Successfully!
          </h2>
          <p className="text-gray-500">Redirecting to executives list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/executives"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">
            Create Executive
          </h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Add a new field executive for GPS-verified land inspections
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter First Name"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter Last Name"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email ID"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Gender (optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
            Coverage Area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Assigned District
              </label>
              <input
                type="text"
                name="assignedDistrict"
                value={formData.assignedDistrict}
                onChange={handleInputChange}
                placeholder="Enter Assigned District"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Assigned Mandal
              </label>
              <input
                type="text"
                name="assignedMandal"
                value={formData.assignedMandal}
                onChange={handleInputChange}
                placeholder="Enter Assigned Mandal"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Assigned Village
              </label>
              <input
                type="text"
                name="assignedVillage"
                value={formData.assignedVillage}
                onChange={handleInputChange}
                placeholder="Enter Assigned Village"
                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Link href="/dashboard/executives">
          <button className="px-8 py-3 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Creating..." : "Create Executive"}
        </button>
      </div>
    </div>
  );
}
