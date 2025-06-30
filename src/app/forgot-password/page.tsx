"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("OTP sent to your email.");
      setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`), 1500);
    } else {
      setError(data.error || "Failed to send OTP.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="w-[400px] bg-purple-50 rounded-lg shadow-lg p-10">
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-bold text-purple-800">SAP</span>
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-800 text-center">Forgot Password</h2>
        <p className="text-purple-600 mb-8 text-center">
          Enter your email to receive an OTP
        </p>
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-800"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
