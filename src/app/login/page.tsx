"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.login(formData);
      setAuth(
        response.admin,
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      router.push("/dashboard");
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
        <div className="mb-10 relative w-48 h-16">
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
              Sign in to your Account
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access the admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
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
                placeholder="admin@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 outline-none focus:border-[#1e2667] focus:ring-1 focus:ring-[#1e2667] transition-all placeholder:text-gray-400 text-gray-900 bg-gray-50/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e2667] text-white font-semibold py-3.5 rounded-xl hover:bg-[#151b4d] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
