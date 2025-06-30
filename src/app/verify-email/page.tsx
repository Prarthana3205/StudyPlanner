"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'pending'|'success'|'error'>("pending");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No token provided.");
      return;
    }
    fetch(`/api/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Verification failed.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="w-[400px] bg-purple-50 rounded-lg shadow-lg p-10 text-center">
        <span className="font-serif text-2xl font-bold text-purple-800">SAP</span>
        <h2 className="text-2xl font-serif font-semibold mb-4 mt-4 text-purple-800">Email Verification</h2>
        {status === "pending" && <p className="text-purple-700">Verifying your email...</p>}
        {status === "success" && <p className="text-green-700">Yes, your email is verified. You can close this tab and finish registration.</p>}
        {status === "error" && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}
