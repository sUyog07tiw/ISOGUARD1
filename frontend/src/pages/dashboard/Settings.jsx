import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";

export default function Settings() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setLoading(true);
    try {
      await api.auth.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Gap Analysis", path: "/gap-analysis" },
    { label: "Reports", path: "/reports" },
    { label: "Settings", path: "/settings", active: true },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex md:flex-col bg-gradient-to-b from-red-900 to-red-950 text-white shadow-2xl">
        <div className="p-6 text-center">
          <img src={logo} alt="ISOGUARD Logo" className="mx-auto w-16 h-16 mb-2 rounded-full" />
          <h1 className="text-2xl font-bold tracking-tight">ISOGUARD</h1>
          <p className="text-xs text-red-200 mt-1">ISO 27001 Validator</p>
        </div>
        <nav className="mt-6 flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block py-3 px-6 rounded-full transition-colors ${
                item.active
                  ? "bg-red-600/90"
                  : "hover:bg-red-700/60 text-red-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          {user && (
            <p className="text-sm text-gray-400 mb-2 truncate">
              {user.name || user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-red-200 text-sm">Manage your account preferences</p>
        </header>

        {/* Change Password Card */}
        <section className="max-w-lg bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
          <p className="text-sm text-gray-400 mb-6">
            Enter your current password first, then set a new one.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg font-semibold hover:from-red-500 hover:to-red-600 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating…" : "Change Password"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
