import React, { useState } from "react";
import bcitLogo from "../../assets/bcit-logo.png";
import { Shield, Lock, GraduationCap, FileText, Users, ArrowRight } from "lucide-react";

type View = "login" | "admin-login";

interface AccessPageProps {
  onLoginSuccess: (role: "user" | "admin") => void;
}

export default function AccessPage({ onLoginSuccess }: AccessPageProps) {
  const [view, setView] = useState<View>("login");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------
  // VALIDATION (Environment Variables)
  // -------------------------
  const validateCode = async (role: "user" | "admin") => {
    setIsLoading(true);
    setMessage("");

    try {
      const expectedCode = role === "user" 
        ? import.meta.env.VITE_USER_ACCESS_CODE 
        : import.meta.env.VITE_ADMIN_ACCESS_CODE;

      if (!expectedCode) {
        setMessage("Access code configuration is missing. Please contact support.");
        return false;
      }

      return expectedCode === code.trim();
    } catch (err) {
      setMessage("An unexpected error occurred.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!code.trim()) {
      setMessage("Please enter an access code.");
      return;
    }

    const role = view === "login" ? "user" : "admin";
    const ok = await validateCode(role);

    if (ok) {
      onLoginSuccess(role);
    } else {
      setMessage(`Invalid ${role === "user" ? "preceptor" : "admin"} code.`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans text-text-main">
      {/* 
        min-h-screen: Ensures the page takes at least the full height of the viewport.
        flex flex-col lg:flex-row: Flexbox layout - vertical stack on mobile, horizontal row on desktop (lg breakpoint).
        bg-background: Uses the theme's background color.
        font-sans text-text-main: Sets the default font family and text color.
      */}
      {/* Left Panel - Brand & Info */}
      {/* 
        lg:w-1/2: Takes up 50% width on desktop.
        bg-bcit-blue: Primary brand background color.
        relative overflow-hidden: Context for absolute positioned background patterns.
        flex flex-col justify-between: Vertical flex layout with space between content and footer.
        p-6 pt-12 pb-24 lg:p-16: Responsive padding - more padding on desktop, specific top/bottom padding for mobile layout.
        shrink-0: Prevents the panel from shrinking when content overflows.
      */}
      <div className="lg:w-1/2 bg-bcit-blue relative overflow-hidden flex flex-col justify-between p-6 pt-12 pb-24 lg:p-16 text-white shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-bcit-dark/50 to-transparent" />

        <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex items-center gap-4 mb-6 lg:mb-12">
            {/* Logo Container */}
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <img src={bcitLogo} alt="BCIT" className="h-8 lg:h-10 w-auto object-contain" />
            </div>
            <div className="h-8 w-px bg-white/30 hidden lg:block" />
            <span className="font-medium tracking-wide text-white/90 text-sm lg:text-base hidden lg:block">School of Health Sciences</span>
          </div>

          <h1 className="text-3xl lg:text-6xl font-bold leading-tight mb-2 lg:mb-6">
            Clinical Feedback <span className="text-bcit-gold">Helper</span>
          </h1>

          <p className="text-sm lg:text-xl text-blue-100 max-w-xl leading-relaxed mb-0 lg:mb-12 hidden lg:block">
            Empowering preceptors with AI-assisted tools to deliver structured,
            standards-based feedback for nursing learners.
          </p>

          <div className="space-y-6 max-w-md hidden lg:block">
            <FeatureItem icon={GraduationCap} text="Aligned with BCCNM Standards" />
            <FeatureItem icon={FileText} text="Organizes Your Thoughts in Minutes" />
            <FeatureItem icon={Users} text="Tailored Learner Improvement Strategies" />
          </div>
        </div>

        <div className="relative z-10 mt-8 lg:mt-12 text-xs lg:text-sm text-blue-200/80 hidden lg:block">
          © {new Date().getFullYear()} British Columbia Institute of Technology
        </div>
      </div>

      {/* Right Panel - Login Form */}
      {/* 
        lg:w-1/2: Takes up 50% width on desktop.
        flex items-center justify-center: Centers the login card vertically and horizontally.
        p-4 lg:p-6: Responsive padding.
        bg-gray-50/50: Subtle background color for the form area.
        -mt-12 lg:mt-0: Negative margin on mobile to pull the card up over the blue header (overlapping effect).
        z-20: Ensures the card sits on top of the blue header.
      */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-6 bg-gray-50/50 -mt-12 lg:mt-0 z-20">
        {/* 
          w-full max-w-md: Full width but capped at medium size (standard login card width).
          bg-white: White card background.
          rounded-3xl: Large rounded corners for modern look.
          shadow-xl: Deep shadow to lift the card off the background.
          border border-gray-100: Subtle border definition.
          p-6 lg:p-10: Responsive internal padding.
          transition-all duration-500: Smooth animation for any layout changes.
        */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-10 transition-all duration-500">

          {/* Role Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              onClick={() => { setView("login"); setMessage(""); setCode(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${view === "login"
                ? "bg-white text-bcit-blue shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Preceptor Access
            </button>
            <button
              onClick={() => { setView("admin-login"); setMessage(""); setCode(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${view === "admin-login"
                ? "bg-white text-bcit-blue shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Administrator
            </button>
          </div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-bcit-blue">
              {view === "login" ? <Shield size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {view === "login" ? "Welcome Back" : "Admin Portal"}
            </h2>
            <p className="text-gray-500">
              {view === "login"
                ? "Enter your access code to start your session."
                : "Secure access for system administrators."}
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                Access Code
              </label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field text-lg tracking-widest text-center"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            {message && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
                {message}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full btn-primary group relative overflow-hidden"
            >
              <span className={`flex items-center gap-2 transition-transform duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {view === "login" ? "Access Workspace" : "Login to Dashboard"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only. Contact your Instructor for support.
            </p>
          </div>
        </div>
      </div>
    </div >
  );
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return (
    <div className="flex items-center gap-4 text-white/90">
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
        <Icon size={20} className="text-bcit-gold" />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
