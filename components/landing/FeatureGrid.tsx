"use client";

import { motion } from "motion/react";
import { ShieldCheck, Zap, Box, Users } from "lucide-react";

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-28 px-8 pb-24">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <motion.div
          whileHover={{ y: -5 }}
          className="group relative flex h-[400px] flex-col justify-end overflow-hidden rounded-2xl border-2 border-primary/10 bg-white p-10 strawberry-shadow md:col-span-2"
        >
          <div className="absolute right-0 top-0 p-10">
            <ShieldCheck className="h-32 w-32 text-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:text-primary/30" />
          </div>
          <div className="relative z-10">
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Safe & Sound
            </span>
            <h3 className="mb-4 text-4xl font-extrabold text-on-surface">
              Soft Security
            </h3>
            <p className="max-w-md text-lg text-on-surface/70">
              Your files are wrapped in a cozy layer of protection before they
              leave your device — with on-chain registration on Shelby.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex flex-col justify-between rounded-2xl border-2 border-primary/20 bg-primary-container p-10 strawberry-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <Zap className="h-8 w-8 fill-secondary text-secondary" />
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-secondary">
              Super Fast
            </span>
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-extrabold text-on-surface">
              Whipped Speed
            </h3>
            <p className="text-base text-on-surface/70">
              Optimized flows from upload to share link — fewer clicks, more
              delight.
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="group flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-primary/10 bg-white p-10 text-center strawberry-shadow"
        >
          <div className="relative">
            <div className="h-24 w-24 animate-[spin_15s_linear_infinite] rounded-full border-4 border-dotted border-primary/40" />
            <Box className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-secondary" />
          </div>
          <div>
            <h3 className="mb-1 text-2xl font-extrabold text-on-surface">
              Sweet Vault
            </h3>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Decentralized
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="flex flex-col items-center gap-12 rounded-2xl border-2 border-primary/5 bg-surface-container p-10 strawberry-shadow md:col-span-2 md:flex-row"
        >
          <div className="flex-1">
            <h3 className="mb-4 text-4xl font-extrabold text-on-surface">
              Share &amp; discover
            </h3>
            <p className="mb-8 text-lg text-on-surface/70">
              Free file sharing for everyone, plus a marketplace for dataset
              creators — all in one pastel workspace.
            </p>
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  alt=""
                  className="h-14 w-14 rounded-full border-4 border-white shadow-sm"
                  src={`https://picsum.photos/seed/u${i}/100/100`}
                  referrerPolicy="no-referrer"
                />
              ))}
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary text-sm font-bold text-white shadow-sm">
                +12
              </div>
            </div>
          </div>
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/10 bg-white md:w-1/3">
            <img
              alt=""
              className="h-full w-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
              src="https://picsum.photos/seed/ssfeature/400/400"
              referrerPolicy="no-referrer"
            />
            <Users className="absolute z-10 h-16 w-16 text-secondary drop-shadow-lg" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
