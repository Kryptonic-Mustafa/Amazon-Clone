"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast"; // Import Toast

// --- COMPONENT: MATRIX BACKGROUND ---
const MatrixBackground = ({ isTyping }: { isTyping: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isTypingRef = useRef(isTyping);

  // Keep ref in sync with prop to use inside the interval
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    const columns = Math.ceil(width / 20);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      const typing = isTypingRef.current;

      // Dark fade trail
      ctx.fillStyle = typing ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      // Text Color (Cyan if typing, Green normally)
      ctx.fillStyle = typing ? "#00ffcc" : "#0f0"; 
      ctx.font = "15px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        // Reset drops randomly
        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Speed up when typing
        drops[i] += typing ? 2 : 1; 
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="text-black absolute inset-0 z-0 pointer-events-none opacity-40"
    />
  );
};

// --- COMPONENT: CUSTOM CURSOR ---
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, []);

  return (
    <motion.div
      className="text-black fixed top-0 left-0 w-8 h-8 border-2 border-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
      animate={{ x: mousePos.x - 16, y: mousePos.y - 16 }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
    />
  );
};

// --- MAIN PAGE ---
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInput = (setter: any, value: string) => {
    setter(value);
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Stop "typing mode" 150ms after the last keystroke
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 150);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Access Granted. Redirecting...");
        router.push("/admin/dashboard");
      } else {
        toast.error(data.error || "Access Denied");
      }
    } catch (err) {
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // fixed inset-0 ensures full screen coverage with NO scrolling
    <div className="text-black fixed inset-0 bg-black flex items-center justify-center overflow-hidden font-sans m-0 p-0">
      
      <CustomCursor />
      <MatrixBackground isTyping={isTyping} />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-black relative z-10 w-full max-w-sm p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Decorative Glows */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl transition-all duration-300 ${isTyping ? "scale-125 opacity-60" : "scale-100 opacity-20"}`} />
        <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl transition-all duration-300 ${isTyping ? "scale-125 opacity-60" : "scale-100 opacity-20"}`} />

        <div className="text-black mb-6 text-center relative">
          <h1 className="text-black text-3xl font-bold text-white tracking-tight mb-1">
            System Access
          </h1>
          <p className="text-black text-slate-400 text-xs uppercase tracking-widest">Identify Yourself</p>
        </div>

        <form onSubmit={handleLogin} className="text-black space-y-5 relative">
          
          {/* Email Input */}
          <div className="text-black relative group">
            <Mail className="text-black absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="email"
              required
              className="text-black w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder-transparent focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all peer"
              placeholder="Email"
              value={email}
              onChange={(e) => handleInput(setEmail, e.target.value)}
            />
            <label className="text-black font-bold block mb-2 absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none">
              User ID
            </label>
          </div>

          {/* Password Input */}
          <div className="text-black relative group">
            <Lock className="text-black absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="password"
              required
              className="text-black w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder-transparent focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all peer"
              placeholder="Password"
              value={password}
              onChange={(e) => handleInput(setPassword, e.target.value)}
            />
            <label className="text-black font-bold block mb-2 absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-sm transition-all peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none">
              Passcode
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-white text-black font-bold py-3 rounded-lg hover:bg-blue-50 transition-all active:scale-[0.98] mt-2 group"
          >
            <div className="text-black relative flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <>
                  <Loader2 className="text-black animate-spin" size={16} /> Verifying...
                </>
              ) : (
                <>
                  Connect <ArrowRight size={16} className="text-black group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="text-black mt-6 text-center">
             <span className="text-black text-[10px] text-slate-600 tracking-widest">ENCRYPTED // V.2.0.4</span>
        </div>
      </motion.div>
    </div>
  );
}