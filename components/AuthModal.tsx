"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/providers";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signup, signin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let err: string | null;
      if (mode === "signup") {
        if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
        err = await signup(email, password, name);
      } else {
        err = await signin(email, password);
      }
      if (err === null) {
        onClose();
      } else {
        setError(err);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="relative card p-8 w-full max-w-md z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-1">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
              {mode === "signin" ? "Sign in to access your favorites and more" : "Create an account to get started"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" placeholder="Your name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" placeholder="••••••••" required minLength={8} />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <motion.button
                type="submit"
                className="btn-primary w-full py-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  mode === "signin" ? "Sign In" : "Sign Up"
                )}
              </motion.button>
            </form>

            <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={switchMode} className="text-[var(--accent-primary)] hover:underline font-medium cursor-pointer">
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}