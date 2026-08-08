"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    const allowedDomains = ["landwalaa.com", "gmail.com"];
    const emailDomain = formData.email.split("@")[1];
    if (!emailDomain || !allowedDomains.includes(emailDomain.toLowerCase())) {
      setError("Please use a landwalaa.com or gmail.com email address");
      setIsLoading(false);
      return;
    }

    try {
      // Requires the current session to be a super admin (backend-enforced).
      // Deliberately does NOT log in as the new admin -- that would replace
      // the acting super admin's own session with the new account's.
      await authApi.register(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", password: "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8FAFC] flex items-center justify-center overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#2D55FB] opacity-[0.15] blur-[120px] pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#2D55FB] opacity-[0.15] blur-[120px] pointer-events-none mix-blend-multiply" />

      <div className="z-10 w-full max-w-[480px] flex flex-col items-center px-4">
        {/* Logo */}
        <div className="mb-8 relative w-48 h-16">
          <Image
            src="/logo.png"
            alt="LandWala"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-100/50 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add New Admin
            </h1>
            <p className="text-gray-500 text-sm">
              Create a new full-privilege admin account. Requires super admin access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create a password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50/30"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
                Admin account created successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e2667] text-white font-semibold py-3.5 rounded-xl hover:bg-[#151b4d] active:scale-[0.98] transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Creating Admin..." : "Create Admin"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                <Link
                  href="/dashboard"
                  className="text-[#1e2667] font-semibold hover:underline"
                >
                  Back to Dashboard
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
