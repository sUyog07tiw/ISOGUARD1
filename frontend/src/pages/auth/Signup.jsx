import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { register } from "../../utils/auth";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    company: "",
    phone_number: "",
    role: "manager",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: "📊", title: "Gap Analysis", desc: "AI-powered ISO 27001 compliance analysis" },
    { icon: "📋", title: "Audit Reports", desc: "Generate comprehensive PDF reports" },
    { icon: "🔍", title: "Risk Assessment", desc: "Identify and track security risks" },
    { icon: "✅", title: "Compliance Tracking", desc: "Monitor your ISMS progress" }
  ];

  const roles = [
    { value: "manager", label: "IT/Compliance Manager", icon: "👔" },
    { value: "auditor", label: "Internal Auditor", icon: "🔍" },
    { value: "officer", label: "Security Officer", icon: "🛡️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:shadow-red-900/50 transition-all duration-300 animate-glow">
              <img src={logo} alt="ISOGUARD" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-black tracking-wide">
              <span className="text-red-500">ISO</span>
              <span className="text-white">GUARD</span>
            </span>
          </Link>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-sm font-medium transition-all duration-300 hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-[calc(100vh-80px)]">
        {/* Left side - Info panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 animate-fade-in-left">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm text-red-300">Free forever for small teams</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">ISO 27001</span> Journey Today
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of organizations using ISOGUARD to achieve and maintain ISO 27001:2022 certification.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{benefit.icon}</span>
                  <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 flex items-center gap-8">
              {[
                { value: "70K+", label: "Certificates" },
                { value: "150+", label: "Countries" },
                { value: "30%", label: "Cost Reduction" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold text-red-500">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 animate-fade-in-right">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                {/* Logo for mobile */}
                <div className="lg:hidden text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30 animate-glow">
                    <img src={logo} alt="ISOGUARD" className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold">Create Account</h2>
                  <p className="text-gray-400 text-sm mt-2">Start your compliance journey</p>
                </div>

                {/* Desktop header */}
                <div className="hidden lg:block mb-8">
                  <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-gray-400">Fill in your details to get started</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex-1 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        step >= s 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {s}
                      </div>
                      {s === 1 && (
                        <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          step > 1 ? 'bg-red-500' : 'bg-white/10'
                        }`}></div>
                      )}
                    </div>
                  ))}
                  <span className="text-sm text-gray-400">{step === 1 ? 'Account Info' : 'Security'}</span>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-shake">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {step === 1 ? (
                    <>
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Full Name</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                          <input
                            name="name"
                            type="text"
                            placeholder="Your Full Name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Corporate Email</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </span>
                          <input
                            type="email"
                            name="email"
                            placeholder="email@company.com"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Company */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Company <span className="text-gray-500">(Optional)</span></label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </span>
                          <input
                            name="company"
                            type="text"
                            placeholder="Your Company Name"
                            value={form.company}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Phone Number <span className="text-gray-500">(Optional)</span></label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </span>
                          <input
                            name="phone_number"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={form.phone_number}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!form.name || !form.email) {
                            setError("Please fill in your name and email");
                            return;
                          }
                          setError("");
                          setStep(2);
                        }}
                        className="group w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        <span>Continue</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Role Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Your Role</label>
                        <div className="grid grid-cols-3 gap-3">
                          {roles.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setForm({ ...form, role: role.value })}
                              className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                                form.role === role.value
                                  ? 'bg-red-500/20 border-red-500/50 text-white'
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                              }`}
                            >
                              <span className="text-2xl block mb-1">{role.icon}</span>
                              <span className="text-xs">{role.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Min. 8 characters"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Password strength indicator */}
                        {form.password && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  form.password.length >= 12 ? 'w-full bg-green-500' :
                                  form.password.length >= 8 ? 'w-2/3 bg-yellow-500' :
                                  'w-1/3 bg-red-500'
                                }`}
                              ></div>
                            </div>
                            <span className={`text-xs ${
                              form.password.length >= 12 ? 'text-green-400' :
                              form.password.length >= 8 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {form.password.length >= 12 ? 'Strong' :
                               form.password.length >= 8 ? 'Medium' : 'Weak'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm_password"
                            placeholder="Confirm your password"
                            required
                            value={form.confirm_password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {form.confirm_password && form.password !== form.confirm_password && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Passwords do not match
                          </p>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3">
                        <input type="checkbox" required className="w-4 h-4 mt-1 rounded border-gray-600 bg-white/5 text-red-500 focus:ring-red-500/50 focus:ring-offset-0" />
                        <span className="text-sm text-gray-400">
                          I agree to the <a href="#" className="text-red-400 hover:text-red-300">Terms of Service</a> and <a href="#" className="text-red-400 hover:text-red-300">Privacy Policy</a>
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-4 rounded-xl border border-white/20 text-gray-300 font-semibold hover:border-white/40 transition-all duration-300"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="group flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Create Account</span>
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-red-400 font-semibold hover:text-red-300 transition-colors">
                      Sign In
                    </Link>
                  </p>
                </div>

                {/* Security badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your data is protected with enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© 2026 ISOGUARD • BSIT Capstone — All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
