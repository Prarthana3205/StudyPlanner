"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

export default function Home() {
  const [todos, setTodos] = useState([
    "Plan your day",
    "Finish React project",
    "Read a book",
  ]);
  const [input, setInput] = useState("");
  const router = useRouter();

  const [abstractRef, abstractInView] = useInView();
  const [todoRef, todoInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const handleAdd = () => {
    if (input.trim()) {
      setTodos([input, ...todos]);
      setInput("");
    }
  };

  const handleDelete = (idx: number) => {
    setTodos(todos.filter((_, i) => i !== idx));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-100 to-yellow-50 overflow-x-hidden snap-y snap-mandatory h-screen">
      {/* Animated SVG Background Shapes */}
      <svg className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] opacity-40 animate-float-slow z-0" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="200" fill="#a78bfa" />
      </svg>
      <svg className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] opacity-30 animate-float z-0" viewBox="0 0 500 500">
        <rect width="500" height="500" rx="250" fill="#facc15" />
      </svg>
      <svg className="absolute top-1/2 left-[-80px] w-[200px] h-[200px] opacity-20 animate-float-fast z-0" viewBox="0 0 200 200">
        <ellipse cx="100" cy="100" rx="100" ry="80" fill="#f472b6" />
      </svg>

      {/* Top right login/register */}
      <div className="fixed top-6 right-8 flex gap-4 z-50 pointer-events-auto">
        <Link
          href="/login"
          className="bg-purple-600 text-white px-5 py-2 rounded font-semibold shadow hover:bg-purple-800 transition-all duration-300 transform hover:scale-105 cursor-pointer relative z-50 pointer-events-auto"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="bg-white text-purple-700 border border-purple-600 px-5 py-2 rounded font-semibold shadow hover:bg-purple-100 transition-all duration-300 transform hover:scale-105 cursor-pointer relative z-50 pointer-events-auto"
        >
          Register
        </Link>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10 snap-start pt-20">
        <span className="font-serif text-4xl md:text-6xl font-bold text-purple-800 mb-4 tracking-wide drop-shadow-lg">
          StudyPlanner
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-900 mb-4 text-center leading-tight drop-shadow">
          Make Every Day <span className="text-yellow-400">Productive</span>
        </h1>
        <p className="text-purple-700 text-xl mb-10 text-center font-medium max-w-xl">
          Organize, track, and accomplish your goals with style.
        </p>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="text-purple-400 text-3xl">&#8595;</span>
          <span className="text-purple-400 text-sm">Scroll down</span>
        </div>
      </section>

      {/* Abstract Section */}
      <section
        ref={abstractRef}
        className={`relative flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 bg-gradient-to-br from-yellow-50 to-purple-100 z-10 snap-start transition-all duration-700 ${
          abstractInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        {/* Floating background shape */}
        <div className="absolute -top-8 right-1/3 w-24 h-24 bg-yellow-200 rounded-full blur-2xl opacity-30 animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-purple-200 rounded-full blur-2xl opacity-30 animate-float-slow pointer-events-none" />
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col items-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 mb-4 text-center drop-shadow-lg">
            <span className="bg-gradient-to-r from-purple-600 to-yellow-400 bg-clip-text text-transparent">Why StudyPlanner?</span>
          </h2>
          <p className="text-lg text-purple-800 text-center mb-2">
            In an era of digital overload, managing tasks effectively is critical for personal productivity and mental clarity.
          </p>
          <p className="text-lg text-purple-800 text-center mb-2">
            <span className="font-semibold text-purple-700"></span> Stay productive and learn smarter with <span className="font-bold bg-gradient-to-r from-purple-600 to-yellow-400 bg-clip-text text-transparent">StudyPlanner + StudyGenie</span> — a powerful web application that helps you manage tasks and study more effectively.
          </p>
          <ul className="text-purple-700 text-base list-disc list-inside mb-2 mt-4 space-y-1 text-left w-full max-w-md mx-auto">
            <li>Plan your day with a beautiful, responsive to-do list.</li>
            <li>Upload PDFs or docs to get instant summaries and AI-generated quizzes.</li>
            <li>Designed for students and busy learners who want to stay on track and absorb more in less time.</li>
            <li>All in one place. Simple. Smart. Efficient.</li>
          </ul>
        </div>
      </section>

      {/* Study Partner Section */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 bg-gradient-to-br from-yellow-50 to-purple-100 z-10 snap-start"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-300 rounded-full blur-2xl opacity-40 animate-float-fast pointer-events-none" />
        <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 mb-6 text-center drop-shadow-lg">
          <span className="bg-gradient-to-r from-purple-600 to-yellow-400 bg-clip-text text-transparent">StudyGenie</span>
        </h2>
        <p className="text-lg text-purple-800 mb-10 text-center max-w-2xl">
          Upload your study materials (PDFs, documents, notes) and let AI help you learn smarter.<br />
          Instantly get summaries or generate quiz questions, just like Quizlet – but all in one place!
        </p>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center items-stretch">
          {/* Upload Card */}
          <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in">
            <div className="bg-yellow-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-3xl group-hover:rotate-12 transition-transform">📄</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">Add PDF/Document</h3>
            <p className="text-purple-700 mb-4 text-center">Upload your notes, textbooks, or slides. Supported: PDF, DOCX, TXT.</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-800 cursor-pointer transition-all">
              Upload File
            </button>
          </div>
          {/* Summary Card */}
          <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in delay-100">
            <div className="bg-purple-200 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-3xl group-hover:rotate-12 transition-transform">📝</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">Get Summary</h3>
            <p className="text-purple-700 mb-4 text-center">Receive a concise summary of your uploaded material, perfect for quick revision.</p>
            <button className="bg-yellow-400 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-yellow-500 transition-all" disabled>
              Generate Summary
            </button>
          </div>
          {/* Quiz Card */}
          <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center group hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in delay-200">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mb-4 text-3xl group-hover:rotate-12 transition-transform">❓</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">Quiz Yourself</h3>
            <p className="text-purple-700 mb-4 text-center">Let AI create quiz questions from your notes. Test your knowledge instantly!</p>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-800 transition-all" disabled>
              Generate Quiz
            </button>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center">
          <span className="text-purple-400 text-2xl animate-bounce">&#8595;</span>
          <span className="text-purple-400 text-sm">More features coming soon</span>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`flex flex-col items-center justify-center min-h-[40vh] px-4 transition-all duration-700 snap-start ${
          ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
        style={{ transitionProperty: "opacity, transform" }}
      >
        <div className="max-w-xl w-full bg-white/80 rounded-2xl shadow-xl p-10 flex flex-col items-center">
          <h4 className="text-2xl font-bold text-purple-800 mb-4 text-center">Ready to get started?</h4>
          <p className="text-lg text-purple-900 mb-6 text-center">
            Log in to start organizing your day with StudyPlanner!
          </p>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow hover:bg-purple-800 transition-all duration-300 text-xl"
            scroll={false}
          >
            Login
          </Link>
        </div>
      </section>

      {/* Global CSS */}
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

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.5s both;
        }

        @keyframes cta-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(168, 139, 250, 0.7), 0 0 0 0 rgba(250, 204, 21, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(168, 139, 250, 0), 0 0 0 20px rgba(250, 204, 21, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(168, 139, 250, 0.7), 0 0 0 0 rgba(250, 204, 21, 0.5);
          }
        }
        .animate-cta-pulse {
          animation: cta-pulse 4s infinite;
        }
      `}</style>
    </div>
  );
}
