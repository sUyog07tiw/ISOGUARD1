import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import logo from "../assets/Logo.jpg";

// Custom hook for intersection observer animations
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useInView();

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [isConnected, setIsConnected] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  // Key statistics
  const globalStats = [
    { value: 70000, suffix: "+", label: "Certificates Issued Globally" },
    { value: 150, suffix: "+", label: "Countries Recognizing ISO 27001" },
    { value: 30, suffix: "%", label: "Reduction in Breach Costs" },
    { value: 20, suffix: "%", label: "Increase in Customer Satisfaction" }
  ];

  const annexAControls = [
    { category: "Organisational", count: 37, examples: "Threat intelligence, ICT readiness, information security policies", icon: "🏢" },
    { category: "People", count: 8, examples: "Responsibilities for security, screening", icon: "👥" },
    { category: "Physical", count: 14, examples: "Physical security monitoring, equipment protection", icon: "🏗️" },
    { category: "Technological", count: 34, examples: "Web filtering, secure coding, data leakage prevention", icon: "💻" }
  ];

  const benefits = [
    {
      title: "Achieve Cost Efficiency",
      description: "Save time and money by preventing costly security breaches. Implement proactive risk management measures to significantly reduce the likelihood of incidents.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Accelerate Sales Growth",
      description: "Streamline your sales process by reducing extensive security documentation requests (RFIs). Showcase your compliance to shorten negotiation times and close deals faster.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Boost Client Trust",
      description: "Demonstrate your commitment to information security to enhance client confidence. Increase customer loyalty in sectors like finance, healthcare, and IT services.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: "Regulatory Compliance",
      description: "Align with GDPR, NIS 2, and other regulatory frameworks. Reduce potential legal liabilities and enhance overall governance across your organization.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Competitive Advantage",
      description: "Position your company as a leader in information security. Gain an edge over competitors who may not hold this certification in the global market.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      title: "Business Continuity",
      description: "Strengthen your business resilience by integrating security and continuity management. Ensure your organization can recover from incidents and continue operations.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  ];

  const ismsComponents = [
    {
      title: "ISMS Framework",
      clause: "Clause 4.2",
      description: "This foundational component establishes systematic policies and procedures for managing information security. It aligns organisational goals with security protocols, fostering a culture of compliance and awareness."
    },
    {
      title: "Risk Evaluation",
      clause: "Clause 6.1",
      description: "Central to ISO 27001, this process involves conducting thorough assessments to identify potential threats. It is essential for implementing appropriate security measures and ensuring continuous monitoring and improvement."
    },
    {
      title: "Annex A Controls",
      clause: "93 Controls",
      description: "ISO 27001:2022 outlines a comprehensive set of controls within Annex A, designed to address various aspects of information security including access control, cryptography, physical security, and incident management."
    }
  ];

  const certificationSteps = [
    { step: 1, title: "Gap Analysis", description: "Identify improvement areas by assessing current practices against ISO 27001 standards to pinpoint discrepancies." },
    { step: 2, title: "ISMS Implementation", description: "Establish and implement an Information Security Management System tailored to your organisational goals." },
    { step: 3, title: "Risk Assessment", description: "Conduct thorough risk assessments and implement the 93 Annex A controls to address identified risks." },
    { step: 4, title: "Internal Audits", description: "Conduct regular internal audits to evaluate the effectiveness of your ISMS and make necessary adjustments." },
    { step: 5, title: "Stage 1 Audit", description: "Certification body reviews your ISMS documentation and assesses readiness for the certification audit." },
    { step: 6, title: "Stage 2 Audit", description: "Complete certification audit verifying implementation and ongoing compliance with ISO 27001:2022 requirements." }
  ];

  const integrations = [
    { standard: "ISO 9001", name: "Quality Management", description: "Align your quality and information security practices to ensure consistent operational standards." },
    { standard: "ISO 22301", name: "Business Continuity", description: "Strengthen your business resilience by integrating security and continuity management." },
    { standard: "ISO 27701", name: "Privacy Management", description: "Protect personal data and ensure GDPR compliance by incorporating privacy management." },
    { standard: "GDPR", name: "Data Protection", description: "Seamlessly align with GDPR requirements through ISO 27001's data protection framework." }
  ];

  const faqs = [
    {
      question: "What are the key differences between ISO 27001:2022 and earlier versions?",
      answer: "The 2022 version introduces 11 new controls, restructures Annex A from 114 to 93 controls, and adds focus on cloud security, threat intelligence, and secure coding. The refinements ensure the standard remains relevant to modern cybersecurity challenges."
    },
    {
      question: "Why should companies prioritise ISO 27001:2022?",
      answer: "ISO 27001:2022 provides a comprehensive framework for managing information security risks. Certified organisations experience fewer security breaches, enhanced client trust, and a 30% reduction in data breach costs."
    },
    {
      question: "How long does it take to achieve ISO 27001 certification?",
      answer: "The timeline varies based on organization size and complexity, typically ranging from 6-18 months. ISOGUARD's automated tools can significantly accelerate this process by streamlining documentation and compliance tasks."
    },
    {
      question: "What industries benefit most from ISO 27001 certification?",
      answer: "While all industries benefit, sectors handling sensitive data see the greatest impact: finance, healthcare, IT services, government contracting, and any organization processing personal data under GDPR requirements."
    },
    {
      question: "How does ISO 27001 integrate with other standards?",
      answer: "ISO 27001 seamlessly integrates with ISO 9001 (Quality), ISO 22301 (Business Continuity), ISO 27701 (Privacy), and regulatory frameworks like GDPR and NIS 2, creating a unified compliance approach."
    }
  ];

  const pillars = [
    {
      title: "Governance & Accountability",
      description: "Board-level visibility, mapped responsibilities, and consistent ISMS reporting keep leadership engaged.",
      icon: "🎯"
    },
    {
      title: "Technical Resilience",
      description: "Access control, cryptography, and infrastructure hardening translate policy into measurable defenses.",
      icon: "🛡️"
    },
    {
      title: "Operational Discipline",
      description: "Documented procedures, change control, and internal audits prevent drift from certified practices.",
      icon: "⚙️"
    },
    {
      title: "Trusted Culture",
      description: "Awareness training, incident response, and a clear risk culture empower every stakeholder.",
      icon: "🤝"
    }
  ];

  const newControls = [
    "Threat Intelligence",
    "Cloud Services Security",
    "ICT Readiness",
    "Physical Security Monitoring",
    "Configuration Management",
    "Information Deletion",
    "Data Masking",
    "Data Leakage Prevention",
    "Monitoring Activities",
    "Web Filtering",
    "Secure Coding"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-red-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 animate-glow">
              <img src={logo} alt="ISOGUARD" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-black tracking-wide">
              <span className="text-red-500">ISO</span>
              <span className="text-white">GUARD</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#why-iso" className="text-gray-300 hover:text-white transition-colors">Why ISO 27001</a>
            <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
            <a href="#framework" className="text-gray-300 hover:text-white transition-colors">Framework</a>
            <a href="#certification" className="text-gray-300 hover:text-white transition-colors">Certification</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-900/40 text-sm font-medium hover:shadow-xl hover:shadow-red-900/50 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm text-red-300">ISO 27001:2022 Certified Platform</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Achieve Robust <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Information Security</span> with ISO 27001
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Our platform empowers your organisation to align with ISO 27001:2022, ensuring comprehensive security management. Protect sensitive data and enhance resilience against cyber threats.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-2xl shadow-red-900/40 font-medium hover:shadow-red-900/60 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  View Dashboard Demo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="pt-8 flex items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free Gap Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>AI-Powered Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Expert Support</span>
                </div>
              </div>
            </div>

            {/* Animated stats card */}
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative rounded-3xl border border-white/10 p-8 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Global ISO 27001 Impact</h3>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium animate-pulse">Live Data</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {globalStats.map((stat, index) => (
                    <div 
                      key={stat.label} 
                      className="border border-white/5 rounded-2xl p-5 bg-white/5 hover:bg-white/10 transition-colors duration-300 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <p className="text-3xl font-bold text-red-500 group-hover:scale-105 transition-transform">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="text-gray-400 mt-2 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Continuous monitoring • Real-time compliance</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Backend Status Banner */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div
          className={`p-4 rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
            isConnected 
              ? "border-green-500/30 bg-green-500/10" 
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
              <span className="font-semibold text-white">System Status:</span>
              <span className={isConnected ? "text-green-300" : "text-red-300"}>{backendStatus}</span>
            </div>
            <span className="text-gray-400 text-sm">Powered by Django + AI Analysis Engine</span>
          </div>
        </div>
      </div>

      {/* Why ISO 27001 Section */}
      <section id="why-iso" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Understanding the Standard
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why ISO 27001:2022 <span className="text-red-500">Matters</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              ISO/IEC 27001 is an Information security management standard that provides organisations with a structured framework to safeguard their information assets and ISMS.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 border border-white/10 hover:border-red-500/30 transition-colors duration-500">
                <h3 className="text-2xl font-bold mb-4">The International Standard for Information Security</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  ISO 27001 provides a systematic methodology for managing sensitive information, ensuring it remains secure. Developed in collaboration with the International Electrotechnical Commission (IEC), it aligns with global best practices in information security.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  This framework integrates comprehensive risk evaluation processes and Annex A controls, forming a robust security strategy. Organisations can effectively identify, analyse, and address vulnerabilities, enhancing their overall security posture.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Risk Assessment", icon: "🎯" },
                  { label: "Risk Management", icon: "📊" },
                  { label: "Continuous Improvement", icon: "📈" },
                  { label: "Compliance Assurance", icon: "✅" }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-red-400 mb-4">Key Components of ISO 27001:2022</h3>
              {ismsComponents.map((component, index) => (
                <div 
                  key={component.title}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">{component.title}</h4>
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs">{component.clause}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{component.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-red-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Business Value
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How ISO 27001 <span className="text-red-500">Benefits</span> Your Business
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Certification signifies a commitment to data protection, enhancing your business reputation and customer trust while providing measurable ROI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 mb-6 group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-red-400 transition-colors">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Annex A Controls Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Annex A Controls
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-red-500">93 Controls</span> Across 4 Domains
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              ISO 27001:2022 restructures controls into four main categories, streamlined from the previous 114 controls to address modern cybersecurity challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {annexAControls.map((control, index) => (
              <div 
                key={control.category}
                className="group relative p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 transition-all duration-500 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 -mr-4 -mt-4 group-hover:opacity-20 transition-opacity">
                  {control.icon}
                </div>
                <div className="relative">
                  <span className="text-5xl font-bold text-red-500 mb-2 block">{control.count}</span>
                  <h3 className="text-xl font-semibold mb-3">{control.category}</h3>
                  <p className="text-gray-400 text-sm">{control.examples}</p>
                </div>
              </div>
            ))}
          </div>

          {/* New Controls in ISO 27001:2022 */}
          <div className="bg-gradient-to-br from-red-950/30 to-transparent rounded-3xl p-8 border border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <span className="text-red-400 font-bold">+11</span>
              </div>
              <h3 className="text-xl font-semibold">New Controls in ISO 27001:2022</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {newControls.map((control, index) => (
                <span 
                  key={control}
                  className="px-4 py-2 rounded-full bg-white/5 text-sm text-gray-300 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {control}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Security Framework
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Four Pillars of <span className="text-red-500">ISMS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar, index) => (
              <div 
                key={pillar.title}
                className="group p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 transition-all duration-500 hover:translate-y-[-4px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{pillar.icon}</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-red-400 mb-3 group-hover:text-red-300 transition-colors">{pillar.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework/ISMS Structure Section */}
      <section id="framework" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                ISMS Framework Structure
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Structured Risk <span className="text-red-500">Management</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ISO 27001:2022 requires organisations to adopt a comprehensive, systematic approach to risk management. This includes risk identification, assessment, treatment, and continuous monitoring.
              </p>

              <div className="space-y-4">
                {[
                  { title: "Risk Identification", desc: "Identify potential threats to sensitive data and evaluate their severity" },
                  { title: "Risk Assessment", desc: "Analyse the likelihood and impact of identified risks" },
                  { title: "Risk Treatment", desc: "Select appropriate treatment options: mitigate, transfer, avoid, or accept" },
                  { title: "Continuous Monitoring", desc: "Regularly review and update practices to adapt to evolving threats" }
                ].map((item, index) => (
                  <div 
                    key={item.title}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold mb-6">Main Clauses (Management System Requirements)</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {[
                    { clause: "0", title: "Introduction", desc: "Overview and purpose of the standard" },
                    { clause: "1", title: "Scope", desc: "Applicability to all organization types" },
                    { clause: "2", title: "Normative References", desc: "Points to ISO 27000 for terms and definitions" },
                    { clause: "3", title: "Terms and Definitions", desc: "Explains key terminology" },
                    { clause: "4", title: "Context of the Organization", desc: "Defining internal/external issues, stakeholders, and the ISMS scope" },
                    { clause: "5", title: "Leadership", desc: "Top management responsibilities, policy, and roles" },
                    { clause: "6", title: "Planning", desc: "Risk assessment, risk treatment, and security objectives (including 6.3 Planning for Changes)" },
                    { clause: "7", title: "Support", desc: "Resources, competence, awareness, and documentation" },
                    { clause: "8", title: "Operation", desc: "Risk assessment implementation and operational controls" },
                    { clause: "9", title: "Performance Evaluation", desc: "Monitoring, measurement, internal audit, and management review" },
                    { clause: "10", title: "Improvement", desc: "Non-conformities and corrective actions" }
                  ].map((item) => (
                    <div 
                      key={item.clause}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium">Clause {item.clause}</span>
                        <span className="text-white font-medium group-hover:text-red-300 transition-colors">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-400 pl-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration with Other Standards */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-red-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Seamless Integration
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Integrates with <span className="text-red-500">Other Standards</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              ISO 27001:2022 seamlessly integrates with other standards, creating synergies that enhance overall regulatory alignment and operational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <div 
                key={integration.standard}
                className="group p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 text-center transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-red-400 font-bold text-lg">{integration.standard}</span>
                </div>
                <h3 className="font-semibold mb-2">{integration.name}</h3>
                <p className="text-gray-400 text-sm">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification Process */}
      <section id="certification" className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Certification Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Path to <span className="text-red-500">ISO 27001</span> Certification
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Achieving ISO 27001:2022 requires a methodical approach. Here's how ISOGUARD guides you through every step.
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificationSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className="relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-red-500/30 transition-all duration-500 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500/30 transition-all">
                      <span className="text-red-400 font-bold text-xl">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-red-400 transition-colors">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Culture Section */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold mb-6">Building a Security-Aware Culture</h3>
                <div className="space-y-4">
                  {[
                    { title: "Phishing Simulations", desc: "Conduct regular security drills and phishing simulations" },
                    { title: "Interactive Workshops", desc: "Engage employees in practical training sessions" },
                    { title: "Clear Policy Development", desc: "Establish guidelines for password management and mobile security" },
                    { title: "Security Governance", desc: "Regular updates and audits of cybersecurity practices" }
                  ].map((item, index) => (
                    <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                Employee Awareness
              </span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Cultivate a <span className="text-red-500">Security Culture</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ISO 27001 emphasises employee awareness and comprehensive training. This approach ensures your employees understand their roles in protecting information assets.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Human error is one of the leading causes of security breaches. By investing in training programs and fostering an environment where employees feel empowered to raise concerns, organisations can significantly reduce incident risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-6">
              Common Questions
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-red-500">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-red-400 flex-shrink-0 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="p-6 pt-0 text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900/50 via-red-950/50 to-gray-900 border border-red-500/20 p-12 md:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.3),_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(239,68,68,0.2),_transparent_50%)]"></div>
            
            <div className="relative text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Achieve <span className="text-red-400">ISO 27001</span> Certification?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Start your compliance journey with ISOGUARD. Our AI-powered platform streamlines certification, reduces manual effort, and ensures robust security management.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl"
                >
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300"
                >
                  View Dashboard Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reports & Evidence Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-950 border border-white/10 rounded-3xl p-10 space-y-6 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                Reports & Evidence
              </span>
              <h2 className="text-3xl font-bold">Secure Document Management</h2>
              <p className="text-gray-300 leading-relaxed">
                Sign in to ISOGUARD to upload audit evidence, review clause mappings, and track remediation steps in one secure, audited workspace. All documents are AI-analysed for ISO 27001 compliance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/40 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Sign in to Dashboard
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-2xl border border-red-500/50 text-red-200 hover:text-white hover:border-red-500 transition-all duration-300"
                >
                  Create an Account
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Document Upload", icon: "📄" },
                { label: "AI Analysis", icon: "🤖" },
                { label: "Gap Reports", icon: "📊" },
                { label: "Evidence Tracking", icon: "✅" }
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center hover:border-red-500/30 transition-colors">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <span className="text-sm text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
                  <img src={logo} alt="ISOGUARD" className="w-8 h-8" />
                </div>
                <span className="text-2xl font-black">
                  <span className="text-red-500">ISO</span>
                  <span className="text-white">GUARD</span>
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Automated ISO/IEC 27001:2022 ISMS Validator. Empowering organisations to achieve robust information security management through AI-powered compliance tools.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { name: "Twitter", icon: "𝕏" },
                  { name: "LinkedIn", icon: "in" },
                  { name: "GitHub", icon: "⌘" }
                ].map((social) => (
                  <a 
                    key={social.name}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gap Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ISO 27001 Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 ISOGUARD • BSIT Capstone — All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
