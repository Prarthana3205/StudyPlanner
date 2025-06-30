'use client'

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const validate = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setSuccess("Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      {/* Existing content */}
      <div className="flex w-[900px] h-[600px] bg-purple-50 rounded-lg shadow-lg overflow-hidden relative z-10">
        {/* Left: Login Form */}
        <div className="w-1/2 flex flex-col justify-center px-12 py-10">
          {/* Logo */}
          <div className="mb-8">
            <span className="font-serif text-2xl font-bold text-purple-800">SAP</span>
          </div>
          {/* Welcome */}
          <h2 className="text-3xl font-serif font-semibold mb-2 text-purple-800">Welcome back !</h2>
          <p className="text-purple-600 mb-8">
            The faster you fill up, the faster you get a ticket
          </p>
          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1 text-purple-800" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-black"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-purple-800" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-black"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-purple-600">
                <input type="checkbox" className="accent-purple-600" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-purple-600 hover:underline">
                Forgot Password
              </Link>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-800"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center border border-purple-300 py-2 rounded hover:bg-purple-100"
              onClick={() => window.location.href = "/api/auth/google"}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
              <span className="font-medium text-purple-800">Sign In with Google</span>
            </button>
          </form>
          <div className="mt-8 text-center text-purple-600 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-purple-800 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
        {/* Right: Image & Text */}
        <div className="w-1/2 relative">
          <img
            src="/loginside.jpg"
            alt="pic"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-8 text-white bg-gradient-to-t from-purple-900/70 to-transparent w-full">
          
            <div className="text-3xl font-serif font-semibold mb-1 ">Prarthana <span className="font-sans text-lg align-middle"></span></div>
            <div className="font-serif text-xl mb-2">Senthil Pandian</div>
            <p className="text-sm leading-relaxed">
            </p>
          </div>
        </div>
      </div>
      {/* Global CSS Animations */}
      <style jsx global>{`
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