import React from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";

export default function GapAnalysis() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { label: "Overview", path: "/dashboard" },
    { label: "Gap Analysis", path: "/gap-analysis", active: true },
    { label: "Reports", path: "/reports" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
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
                item.active ? "bg-red-600/90" : "hover:bg-red-700/60 text-red-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          {user && <p className="text-sm text-gray-400 mb-2 truncate">{user.name || user.email}</p>}
          <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <header>
          <h2 className="text-2xl font-bold text-white">Gap Analysis</h2>
          <p className="text-red-200 text-sm">Identify compliance gaps against ISO/IEC 27001:2022</p>
        </header>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
          <p className="text-gray-400 text-sm">Upload your ISMS documentation on the Dashboard first. Gap Analysis results will appear here after processing.</p>
        </section>
      </main>
    </div>
  );
}
