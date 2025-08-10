"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ProfileEmailVerificationContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const verifyProfileEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setVerificationStatus('error');
        setMessage('Invalid verification link - missing token or email');
        return;
      }

      try {
        const res = await fetch('/api/email-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (res.ok) {
          setVerificationStatus('success');
          setMessage(data.message || 'Email changed successfully');
          
          // Redirect to dashboard after 3 seconds to refresh user data
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('Network error occurred');
      }
    };

    verifyProfileEmail();
  }, [searchParams, mounted]);

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

      {/* Centered Verification Result */}
      <div className="relative z-10 w-full max-w-md bg-purple-50 rounded-2xl shadow-xl px-12 py-10 flex flex-col justify-center text-center">
        {/* Logo */}
        <div className="mb-8">
          <span className="font-serif text-2xl font-bold text-purple-800">StudyPlanner</span>
        </div>

        {/* Verification Status */}
        {verificationStatus === 'loading' && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-900">
              Verifying your new email...
            </h2>
            <p className="text-purple-700">
              Please wait while we verify your new email address for your profile.
            </p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-900">
              Email Address Updated!
            </h2>
            <p className="text-purple-700">
              Your profile email address has been successfully updated. You can now use your new email address to log in to your StudyPlanner account.
            </p>
            <p className="text-purple-600 text-sm mt-3">
              You will be redirected to the dashboard in 3 seconds...
            </p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-900">
              Email Verification Failed
            </h2>
            <p className="text-purple-700">
              {message}. Please try updating your email address again from your profile settings.
            </p>
          </>
        )}

        {/* Additional Info */}
        {verificationStatus !== 'loading' && (
          <div className="mt-6 text-sm text-purple-600">
            <p>You can close this window when you're done.</p>
          </div>
        )}
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

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-yellow-50">
      <div className="relative z-10 w-full max-w-md bg-purple-50 rounded-2xl shadow-xl px-12 py-10 flex flex-col justify-center text-center">
        <div className="mb-8">
          <span className="font-serif text-2xl font-bold text-purple-800">StudyPlanner</span>
        </div>
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
        <h2 className="text-2xl font-serif font-semibold mb-2 text-purple-900">
          Loading...
        </h2>
        <p className="text-purple-700">
          Please wait while we load the verification page.
        </p>
      </div>
    </div>
  );
}

export default function ProfileEmailVerification() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileEmailVerificationContent />
    </Suspense>
  );
}
