"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Upload } from "lucide-react";

export function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-8 py-12 md:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary-container px-5 py-2"
        >
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary" />
          <span className="text-xs font-bold uppercase tracking-widest text-on-primary">
            V2.0 Now Sweetly Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-5xl font-extrabold leading-none tracking-tight text-on-surface md:text-7xl lg:text-8xl"
        >
          Share Files. <br />
          <span className="italic text-secondary">Instantly. Securely.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-2xl text-lg font-medium leading-relaxed text-on-surface/70 md:text-xl"
        >
          The cozy digital vault for your most precious assets. High-speed
          transfers, delightful encryption, and soft-as-silk collaboration —
          powered by Shelby Protocol.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-6 sm:flex-row"
        >
          <Link
            href="#upload"
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-secondary px-10 py-4 text-lg font-bold text-white strawberry-shadow transition-all hover:scale-105 active:scale-95 sm:px-12 sm:py-5"
          >
            <span className="relative z-10">Upload File</span>
            <Upload className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-12" />
          </Link>
          <Link
            href="/marketplace"
            className="rounded-2xl border-2 border-primary/30 bg-white px-10 py-4 text-lg font-bold text-on-surface transition-all hover:bg-primary/5 active:scale-95 sm:px-12 sm:py-5"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
