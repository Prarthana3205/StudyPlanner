"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } else if (res.status === 404) {
      setError("User not found. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setError(data.error || "Failed to reset password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 relative overflow-hidden">
      {/* Animated SVG Background Shapes */}
      <svg
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] opacity-40 animate-float-slow z-0"
        viewBox="0 0 400 400"
      >
        <circle cx="200" cy="200" r="200" fill="#a78bfa" />
      </svg>
      <svg
        className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] opacity-30 animate-float z-0"
        viewBox="0 0 500 500"
      >
        <rect width="500" height="500" rx="250" fill="#facc15" />
      </svg>
      <svg
        className="absolute top-1/2 left-[-80px] w-[200px] h-[200px] opacity-20 animate-float-fast z-0"
        viewBox="0 0 200 200"
      >
        <ellipse cx="100" cy="100" rx="100" ry="80" fill="#f472b6" />
      </svg>
      
      <div className="w-[400px] bg-purple-50 rounded-lg shadow-lg p-10 relative z-10">
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-bold text-purple-800">StudyPlanner</span>
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-800 text-center">Reset Password</h2>
        <p className="text-purple-600 mb-8 text-center">
          Enter your new password
        </p>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1 text-purple-800" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full border border-purple-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-purple-600 text-gray-800 !bg-purple-50"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 focus:outline-none"
              >
                {showPassword ? (
                  <img src="/close-eye.png" alt="Hide password" className="w-5 h-5" />
                ) : (
                  <img src="/view.png" alt="Show password" className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1 text-purple-800" htmlFor="confirm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full border border-purple-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-purple-600 text-gray-800 !bg-purple-50"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <img src="/close-eye.png" alt="Hide password" className="w-5 h-5" />
                ) : (
                  <img src="/view.png" alt="Show password" className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-800"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
      
      {/* Global CSS for input styling and animations */}
      <style jsx global>{`
        input[type="text"], input[type="email"], input[type="password"] {
          background-color: #f3f4f6 !important;
          color: #374151 !important;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-30px);}
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-15px);}
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px);}
          50% { transform: translateY(-50px);}
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}