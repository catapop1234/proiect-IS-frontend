"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/providers";
import { api } from "@/lib/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const data: Record<string, string> = {};
    if (name !== user?.name) data.name = name;
    if (email !== user?.email) data.email = email;
    if (password) {
      data.password = password;
      data.passwordConfirm = passwordConfirm;
      data.oldPassword = password;
    }
    if (Object.keys(data).length === 0) {
      setMessage("No changes to save.");
      setLoading(false);
      return;
    }
    const ok = await updateUser(data);
    if (ok === null) {
      setMessage("Updated successfully!");
      setPassword("");
      setPasswordConfirm("");
    } else {
      setError(ok);
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    setClearing(true);
    await api.clearHistory();
    setMessage("Search history cleared!");
    setClearing(false);
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

            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" />
              </div>
              <hr className="border-[var(--border-color)]" />
              <p className="text-xs text-[var(--text-muted)]">Leave blank to keep current password</p>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field w-full" placeholder="••••••••" minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Confirm Password</label>
                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="input-field w-full" placeholder="••••••••" minLength={6} />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {message && <p className="text-green-500 text-sm">{message}</p>}

              <motion.button type="submit" className="btn-primary w-full py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            </form>

            <hr className="border-[var(--border-color)] my-6" />

            <motion.button
              onClick={handleClearHistory}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear Search History"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}