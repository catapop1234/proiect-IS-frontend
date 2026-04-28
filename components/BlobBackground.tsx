"use client";

import { motion } from "framer-motion";

export default function BlobBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className="blob blob-1"
        animate={{
          x: [0, 30, -20, 20, 0],
          y: [0, -30, 20, 30, 0],
          scale: [1, 1.05, 0.95, 1.02, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="blob blob-2"
        animate={{
          x: [0, -30, 20, -20, 0],
          y: [0, 30, -20, -30, 0],
          scale: [1, 0.95, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -7,
        }}
      />
      <motion.div
        className="blob blob-3"
        animate={{
          x: [0, 20, -30, 20, 0],
          y: [0, -20, 30, -20, 0],
          scale: [1, 1.02, 0.98, 1.05, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: -14,
        }}
      />
    </div>
  );
}