"use client";

import { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setIsSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      updateUser(updated);
      setProfileSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update profile.";
      setProfileError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      // Changing the password revokes all sessions server-side; force a clean re-login.
      logout();
      router.push("/login");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to change password.";
      setPasswordError(Array.isArray(message) ? message.join(", ") : message);
      setIsSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const userInitial = profileForm.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-500 italic">
          Manage your account information and security.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] border border-gray-100 p-8 mb-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Profile details
          </h2>
          <button
            onClick={() => {
              if (isEditing && user) {
                setProfileForm({ name: user.name, email: user.email });
              }
              setProfileError(null);
              setProfileSuccess(null);
              setIsEditing(!isEditing);
            }}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          >
            <Pencil className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl bg-[#1e2667] flex items-center justify-center flex-shrink-0 text-white text-2xl font-medium">
            {userInitial}
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 block">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full bg-[#ecf2f9] border border-blue-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-[#1e2667]"
                />
              ) : (
                <p className="text-[#1e2667] font-medium text-base">
                  {profileForm.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 block">
                Email Id
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full bg-[#ecf2f9] border border-blue-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-[#1e2667]"
                />
              ) : (
                <p className="text-[#1e2667] font-medium text-base">
                  {profileForm.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 block">
                Role
              </label>
              <p className="text-[#1e2667] font-medium text-base capitalize">
                {user?.role?.toLowerCase().replace("_", " ") || "-"}
              </p>
            </div>
          </div>
        </div>

        {profileError && (
          <p className="text-sm text-red-600 mt-6">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="text-sm text-green-600 mt-6">{profileSuccess}</p>
        )}

        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-8 border-b border-gray-100 pb-4">
          Change Password
        </h2>

        <form
          onSubmit={handleChangePassword}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 block">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="w-full bg-[#ecf2f9] border border-blue-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-[#1e2667]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 block">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              required
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-[#ecf2f9] border border-blue-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-[#1e2667]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500 block">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full bg-[#ecf2f9] border border-blue-100 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-[#1e2667]"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-600 md:col-span-3">
              {passwordError}
            </p>
          )}

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingPassword && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Logout Button */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="px-8 py-3 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
