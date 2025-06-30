"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(90);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    if (val === "") {
      newOtp[idx] = "";
      setOtp(newOtp);
      return;
    }
    newOtp[idx] = val[val.length - 1];
    setOtp(newOtp);
    if (idx < 5 && val) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const newOtp = [...otp];
      newOtp[idx - 1] = "";
      setOtp(newOtp);
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const otpValue = otp.join("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otpValue }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      setError(data.error || "Invalid OTP.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("OTP resent to your email.");
      setTimer(90);
    } else {
      setError(data.error || "Failed to resend OTP.");
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="w-[400px] bg-purple-50 rounded-lg shadow-lg p-10">
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl font-bold text-purple-800">SAP</span>
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-800 text-center">Verify OTP</h2>
        <p className="text-purple-600 mb-8 text-center">
          Enter the 6-digit code sent to your email
        </p>
        <div className="text-center text-purple-700 font-semibold mb-4">
          {timer > 0 ? `OTP valid for: ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')}` : "OTP expired. Please resend code."}
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 mb-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputsRef.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-10 h-12 text-center border border-purple-300 rounded text-xl focus:outline-none focus:border-purple-600 bg-white text-black"
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {message && <div className="text-green-600 text-sm text-center">{message}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold transition hover:bg-purple-800"
            disabled={loading || timer <= 0}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            className="text-purple-600 hover:underline text-sm"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Resending..." : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
