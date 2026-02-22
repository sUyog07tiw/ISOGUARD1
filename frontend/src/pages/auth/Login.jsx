import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { login } from "../../utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const justRegistered = location.state?.registered === true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "🔒", text: "Bank-grade encryption" },
    { icon: "📊", text: "Real-time compliance tracking" },
    { icon: "🤖", text: "AI-powered gap analysis" },
    { icon: "📋", text: "Automated audit reports" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-red-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
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
            to="/signup"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-900/40 text-sm font-medium hover:shadow-xl hover:shadow-red-900/50 transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-[calc(100vh-80px)]">
        {/* Left side - Info panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 animate-fade-in-left">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm text-red-300">Secure Access Portal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Welcome  to <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">ISOGUARD</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Access your ISO 27001:2022 compliance dashboard. Monitor your ISMS, track gaps, and generate audit reports.
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all duration-300 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                  <span className="text-gray-300 group-hover:text-white transition-colors">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
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
                  <h2 className="text-2xl font-bold">Welcome Back</h2>
                  <p className="text-gray-400 text-sm mt-2">Sign in to your ISOGUARD account</p>
                </div>

                {/* Desktop header */}
                <div className="hidden lg:block mb-8">
                  <h2 className="text-2xl font-bold mb-2">Sign In</h2>
                  <p className="text-gray-400">Enter your credentials to access your dashboard</p>
                </div>

                {justRegistered && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-300 text-sm">Account created successfully! Please sign in.</span>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-shake">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 group-focus-within:text-red-400 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all duration-300"
                      />
                    </div>
                  </div>

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
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-white/5 text-red-500 focus:ring-red-500/50 focus:ring-offset-0" />
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-red-400 hover:text-red-300 transition-colors">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg shadow-red-900/40 hover:shadow-xl hover:shadow-red-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-red-400 font-semibold hover:text-red-300 transition-colors">
                      Create Account
                    </Link>
                  </p>
                </div>

                {/* Security badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit SSL encrypted connection</span>
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
