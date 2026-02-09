import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { logout, getCurrentUser } from "../../utils/auth";
import api from "../../utils/api";


export default function Dashboard() {
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const fileInputRef = useRef(null);

  const handleSelectFiles = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Only allow PDF files
    const pdfFiles = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      alert('Only PDF files are allowed.');
      return;
    }

    const formData = new FormData();
    for (const file of pdfFiles) {
      formData.append('files', file);
    }

    try {
      await api.upload('/documents/upload/', formData);
      alert('Files uploaded successfully');
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    }
  };

  const complianceStats = [
    { label: "Overall Score", value: "68%", color: "text-red-400" },
    { label: "Annex A Controls", value: "42/93", color: "text-red-300" },
    { label: "Critical Gaps", value: "12", color: "text-yellow-300" },
    { label: "Maturity Level", value: "Level 2", color: "text-orange-300" },
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
          <Link to="/dashboard" className="block py-3 px-6 bg-red-600/90 rounded-full transition-colors">Overview</Link>
          <Link to="/gap-analysis" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Gap Analysis</Link>
          <Link to="/reports" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Reports</Link>
          <Link to="/settings" className="block py-3 px-6 hover:bg-red-700/60 text-red-100 rounded-full transition-colors">Settings</Link>
        </nav>
        {/* User Info & Logout */}
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
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Compliance Dashboard</h2>
            <p className="text-red-200 text-sm">
              {user ? `Welcome back, ${user.name || 'User'}!` : 'Real-time ISMS validation against ISO/IEC 27001:2022'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gradient-to-br from-red-600 to-red-700 border border-red-500 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
              Export Audit Report (PDF)
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {complianceStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <section className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-900/70 p-8 rounded-3xl border border-red-500/30 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Validate New Evidence</h3>
            <p className="text-sm text-red-200 mb-6">Drop audit evidence and ISOGUARD highlights every clause, control, and risk.</p>
            <div
              className={`flex flex-col items-center justify-center p-12 rounded-2xl transition-all border-2 ${dragActive ? 'border-red-500/70 bg-red-500/10' : 'border-white/10 bg-gray-900'}`}
              onDragOver={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragActive(false);
                const dropped = e.dataTransfer.files;
                if (!dropped || dropped.length === 0) return;

                // Only allow PDF files
                const pdfFiles = Array.from(dropped).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
                if (pdfFiles.length === 0) {
                  alert('Only PDF files are allowed.');
                  return;
                }

                const formData = new FormData();
                for (const file of pdfFiles) formData.append('files', file);

                try {
                  await api.upload('/documents/upload/', formData);
                  alert('Files uploaded successfully');
                } catch (err) {
                  console.error(err);
                  alert('Upload failed: ' + (err.message || 'Unknown error'));
                }
              }}
            >
              <svg className="w-12 h-12 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-300">Drag and drop your Policy or Audit Report here</p>
              <p className="text-xs text-gray-400 mt-2">Supports PDF only (Max 10MB)</p>
              <button className="mt-6 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
                <span onClick={handleSelectFiles}>Select Files</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </section>

          {/* Remediation Priorities */}
          <section className="bg-white/10 p-6 rounded-3xl shadow-2xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Urgent Remediation</h3>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border-l-4 border-red-500">
                <p className="text-xs font-bold text-red-700">HIGH PRIORITY</p>
                <p className="text-sm text-gray-800">Annex A.8.10: Information Deletion policy missing.</p>
              </div>
              <div className="p-3 bg-orange-50 border-l-4 border-orange-500">
                <p className="text-xs font-bold text-orange-700">MEDIUM PRIORITY</p>
                <p className="text-sm text-gray-800">Clause 6.2: ISMS Objectives not documented.</p>
              </div>
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-700">TIP</p>
                <p className="text-sm text-gray-800">Review Access Control logs for Annex A.8.3.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
