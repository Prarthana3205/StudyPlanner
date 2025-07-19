"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();

  const validateEmailFormat = (email: string): boolean => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length < 8) return "Weak";
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pw)) return "Strong";
    if (/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(pw)) return "Medium";
    return "Weak";
  };

  const checkEmailVerification = async () => {
    if (!email) return;
    
    try {
      const res = await fetch("/api/check-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.isVerified) {
        setEmailVerified(true);
        setEmailSent(false);
        setSuccess("Email verified successfully!");
      }
    } catch (err) {
      // Silently handle error - user might not have started verification yet
    }
  };

  const isFormValid = () => {
    return name.trim().length > 0 && 
           validateEmailFormat(email) && 
           password.length >= 8;
  };

  const canSubmit = () => {
    return isFormValid() && emailVerified;
  };

  const getSubmitMessage = () => {
    if (!emailVerified) {
      return "Please verify your email address first";
    }
    return "";
  };

  const handleEmailVerification = async () => {
    if (!isFormValid()) {
      setError("Please fill in all fields correctly before verifying email.");
      return;
    }

    if (!validateEmailFormat(email)) {
      setError("Please enter a valid email address before verifying.");
      return;
    }

    setVerifyingEmail(true);
    setError("");
    
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email verification failed");

      setEmailSent(true);
      setSuccess("Verification email sent! Please check your inbox and click the verification link.");
      
      // Start polling for verification status
      const pollInterval = setInterval(() => {
        checkEmailVerification();
      }, 3000); // Check every 3 seconds

      // Stop polling after 10 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 600000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const validate = () => {
    if (!canSubmit()) {
      setError(getSubmitMessage());
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-yellow-50 relative overflow-hidden">
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

      {/* Centered Registration Form */}
      <div className="relative z-10 w-full max-w-md bg-purple-50 rounded-2xl shadow-xl px-12 py-10 flex flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-bold text-purple-800">StudyPlanner</span>
        </div>
        {/* Welcome */}
        <h2 className="text-3xl font-serif font-semibold mb-2 text-purple-900 text-center">
          Create your account
        </h2>
        <p className="text-purple-700 mb-8 text-center">
          Join us and start organizing your tasks!
        </p>
        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block font-medium mb-1 text-purple-800">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-gray-800 !bg-purple-50"
              required
              value={name}
              onChange={e => {
                setName(e.target.value);
                setEmailVerified(false);
                setEmailSent(false);
              }}
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1 text-purple-800">Email</label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="flex-1 border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-gray-800 !bg-purple-50"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                  setEmailSent(false);
                }}
              />
              <button
                type="button"
                onClick={handleEmailVerification}
                disabled={verifyingEmail || !isFormValid() || emailVerified || emailSent}
                className={`px-4 py-2 rounded font-medium text-sm transition ${
                  emailVerified
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : emailSent
                    ? "bg-blue-600 text-white cursor-not-allowed"
                    : verifyingEmail || !isFormValid()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {emailVerified 
                  ? "✓ Verified" 
                  : emailSent 
                  ? "Email Sent" 
                  : verifyingEmail 
                  ? "Verifying..." 
                  : "Verify"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block font-medium mb-1 text-purple-800">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="w-full border border-purple-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-purple-600 text-gray-800 !bg-purple-50"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                  setEmailVerified(false);
                  setEmailSent(false);
                }}
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
            {password && (
              <div
                className={`text-sm mt-1 ${
                  passwordStrength === "Strong"
                    ? "text-green-600"
                    : passwordStrength === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                Password strength: {passwordStrength}
              </div>
            )}
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-800"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-8 text-center text-purple-700 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-500 font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>

      {/* Global CSS Animations */}
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