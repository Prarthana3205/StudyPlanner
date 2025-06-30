"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="w-[400px] bg-purple-50 rounded-lg shadow-lg p-10">
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-bold text-purple-800">SAP</span>
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
            <input
              id="password"
              type="password"
              placeholder="New password"
              className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-black"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-purple-800" htmlFor="confirm">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Confirm password"
              className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:border-purple-600 text-black"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
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
    </div>
  );
}
