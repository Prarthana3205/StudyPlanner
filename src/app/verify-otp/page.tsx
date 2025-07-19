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
                className="w-10 h-12 text-center border border-purple-300 rounded text-xl focus:outline-none focus:border-purple-600 !bg-purple-50 text-gray-800"
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
