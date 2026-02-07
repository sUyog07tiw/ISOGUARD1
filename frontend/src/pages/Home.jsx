import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import logo from "../assets/Logo.jpg";

const Home = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await api.healthCheck();
        setBackendStatus(response.status || "Connected");
        setIsConnected(true);
      } catch {
        setBackendStatus("Backend not reachable");
        setIsConnected(false);
      }
    };
    checkBackendConnection();
  }, []);


  const stats = [
    { value: "93", label: "Annex A Controls" },
    { value: "10", label: "Core Clauses" },
    { value: "24/7", label: "Monitoring" },
    { value: "100%", label: "Evidence Traceability" }
  ];

  const pillars = [
    {
      title: "Governance & Accountability",
      description:
        "Board-level visibility, mapped responsibilities, and consistent ISMS reporting keep leadership engaged."
    },
    {
      title: "Technical Resilience",
      description:
        "Access control, cryptography, and infrastructure hardening translate policy into measurable defenses."
    },
    {
      title: "Operational Discipline",
      description:
        "Documented procedures, change control, and internal audits prevent drift from certified practices."
    },
    {
      title: "Trusted Culture",
      description: "Awareness training, incident response, and a clear risk culture empower every stakeholder."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <nav className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <img src={logo} alt="ISOGUARD" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-black tracking-wide">
              <span className="text-red-500">ISO</span>
              <span className="text-white">GUARD</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm uppercase tracking-[0.2em]">
            <Link to="/login" className="text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-xl shadow-red-800/40 text-xs tracking-[0.4em]"
            >
              Start
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative z-0 pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-red-300">ISO 27001:2022</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Build a future-ready ISMS with <span className="text-red-500">ISOGUARD</span>
            </h1>
            <p className="text-lg text-gray-200 leading-relaxed">
              Automated compliance insights that explain why ISO matters and how every risk owner, auditor, and
              executive can make data-driven decisions instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-2xl shadow-red-900/40"
              >
                Launch Assessment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-red-500 rounded-full text-red-200 hover:text-white transition"
              >
                Preview Dashboard
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(239,68,68,0.35),_transparent_55%)] animate-pulse"></div>
            <div className="relative rounded-3xl border border-white/10 p-8 bg-white/5 backdrop-blur-xl shadow-2xl">
              <h3 className="text-xl font-semibold text-red-300 mb-3">Realtime ISO Health Snapshot</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                {stats.map((stat) => (
                  <div key={stat.label} className="border border-white/5 rounded-2xl p-4 bg-white/5">
                    <p className="text-3xl font-bold text-red-500">{stat.value}</p>
                    <p className="text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
                <span>Continuous monitoring • AI analysis</span>
                <span className="text-red-400 font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`p-4 rounded-2xl border ${
            isConnected ? "border-green-500/60 bg-green-500/10" : "border-red-500/60 bg-red-500/10"
          }`}
        >
          <div className="flex items-center gap-3 text-sm">
            <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className="font-semibold text-white">Backend Status:</span>
            <span className={isConnected ? "text-green-300" : "text-red-300"}>{backendStatus}</span>
            <span className="text-gray-400">(powered by Django + DRF)</span>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-red-400">What is ISO?</p>
            <h2 className="text-3xl font-bold">The standard that guarantees trust</h2>
            <p className="text-gray-300 leading-relaxed">
              ISO codifies proven practices that ensure quality, interoperability, cyber resilience, and accountability.
            </p>
            <p className="text-gray-300 leading-relaxed">
              ISO/IEC 27001:2022 dictates how to establish, operate, monitor, and continually improve an ISMS, creating
              a shared language around control maturity and risk.
            </p>
          </div>
          <div className="space-y-4 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-2xl font-semibold text-white">Why companies adopt ISO</h3>
            <ul className="space-y-4 text-gray-300">
              {[
                "Earn assurance for customers and partners.",
                "Stand up to regulatory pressure.",
                "Mitigate supply-chain risks.",
                "Save money through repeatable audits.",
                "Scale securely through growth."
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="text-red-500">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-400">
              ISO certification signals that your ISMS is measurable, accountable, and resilient to modern threats.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Every clause matters</h3>
            <p className="text-gray-400 text-sm">
              Clause 4-10 covers context, leadership, planning, support, operation, performance evaluation, and improvement.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Annex A controls</h3>
            <p className="text-gray-400 text-sm">
              The 93 controls across Operational, Physical, and Technological domains guard modern threats.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Why now?</h3>
            <p className="text-gray-400 text-sm">
              Cyber risk is no longer hypothetical. A documented ISMS reduces breach costs and accelerates remediation.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h3 className="text-2xl font-semibold text-red-400">{pillar.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-950 border border-white/10 rounded-3xl p-10 space-y-4 shadow-2xl">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.5em] text-red-400">Reports & Evidence</p>
            <h2 className="text-3xl font-bold">Authenticated uploads live in the dashboard</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sign in to ISOGUARD to upload audit evidence, review clause mappings, and track remediation steps in one secure, audited workspace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              to="/login"
              className="flex-1 text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-red-600 transition"
            >
              Sign in to Dashboard
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center px-6 py-3 rounded-2xl border border-red-500 text-red-200 hover:text-white transition"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-black/20 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">ISOGUARD</p>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Automated ISO/IEC 27001:2022 ISMS Validator</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">© 2026 ISOGUARD • BSIT Capstone — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
