"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Loader2, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { agentsApi } from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

const steps = [
  { id: 1, label: "Personal info" },
  { id: 2, label: "KYC Documents" },
  { id: 3, label: "Agent Bank Information" },
  { id: 4, label: "Location assignment" },
];

interface AgentFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  // Address
  addressLine: string;
  district: string;
  mandal: string;
  village: string;
  pincode: string;
  // Bank Details
  payeeName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  accountType: string;
  // Location Assignment
  assignedDistrict: string;
  assignedMandal: string;
  assignedVillage: string;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const aadharInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<AgentFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    addressLine: "",
    district: "",
    mandal: "",
    village: "",
    pincode: "",
    payeeName: "",
    accountNumber: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    accountType: "",
    assignedDistrict: "",
    assignedMandal: "",
    assignedVillage: "",
  });

  const [files, setFiles] = useState<{
    aadharCard: File | null;
    panCard: File | null;
  }>({
    aadharCard: null,
    panCard: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "aadharCard" | "panCard") => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          submitData.append(key, value);
        }
      });

      // Add files
      if (files.aadharCard) {
        submitData.append("aadharCard", files.aadharCard);
      }
      if (files.panCard) {
        submitData.append("panCard", files.panCard);
      }

      await agentsApi.createAgent(submitData);
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/agents");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Created Successfully!</h2>
          <p className="text-gray-500">Redirecting to agents list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/agents"
            className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Create Agent</h1>
        </div>
        <p className="text-gray-500 italic ml-8">
          Add all the details to create the new agent
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-20">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center relative">
              <div className="relative flex flex-col items-center">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 relative transition-colors duration-200",
                    currentStep >= step.id
                      ? "border-[#1e2667]"
                      : "border-gray-200"
                  )}
                >
                  {currentStep >= step.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1e2667]" />
                  )}
                </div>
                <div
                  className={clsx(
                    "absolute top-8 left-1/2 -translate-x-1/2 w-32 md:w-40 text-center text-xs font-medium transition-colors duration-200",
                    currentStep >= step.id ? "text-[#1e2667]" : "text-gray-400"
                  )}
                >
                  {step.label}
                </div>
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={clsx(
                    "h-0.5 w-24 md:w-72 mx-2 transition-colors duration-200",
                    currentStep > step.id ? "bg-[#1e2667]" : "bg-gray-100"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <>
            {/* Personal Information */}
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
                    placeholder="Enter Phone Number"
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
                    Gender
                  </label>
                  <select
                    onFocus={scrollSelectIntoView}
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Address Line
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    placeholder="Enter Address Line"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter District"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Mandal
                  </label>
                  <input
                    type="text"
                    name="mandal"
                    value={formData.mandal}
                    onChange={handleInputChange}
                    placeholder="Enter Mandal"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Village
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    placeholder="Enter Village"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter Pincode"
                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              KYC Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Aadhar Card Upload
                </label>
                <input
                  type="file"
                  ref={aadharInputRef}
                  onChange={(e) => handleFileChange(e, "aadharCard")}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <div
                  onClick={() => aadharInputRef.current?.click()}
                  className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  {files.aadharCard ? (
                    <span className="text-gray-900 font-medium">{files.aadharCard.name}</span>
                  ) : (
                    <span className="text-gray-400">Click to upload Aadhar Card</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  PAN Card Upload
                </label>
                <input
                  type="file"
                  ref={panInputRef}
                  onChange={(e) => handleFileChange(e, "panCard")}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <div
                  onClick={() => panInputRef.current?.click()}
                  className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  {files.panCard ? (
                    <span className="text-gray-900 font-medium">{files.panCard.name}</span>
                  ) : (
                    <span className="text-gray-400">Click to upload PAN Card</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Agent Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Payee Name
                </label>
                <input
                  type="text"
                  name="payeeName"
                  value={formData.payeeName}
                  onChange={handleInputChange}
                  placeholder="Enter Payee Name"
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Account Number"
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter Bank Name"
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="Enter Branch"
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC Code"
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Account Type
                </label>
                <select
                  onFocus={scrollSelectIntoView}
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
                >
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Location Assignment
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
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 mt-8">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-8 py-3 rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Previous
          </button>
        )}
        <Link href="/dashboard/agents">
          <button className="px-8 py-3 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {currentStep === 4 ? (isSubmitting ? "Creating..." : "Create") : "Next"}
        </button>
      </div>
    </div>
  );
}
