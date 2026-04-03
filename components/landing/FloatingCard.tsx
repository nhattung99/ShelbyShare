"use client";

import { motion } from "motion/react";
import { FileArchive, Download } from "lucide-react";

export function FloatingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-10 right-10 z-40 hidden xl:block"
    >
      <div className="w-80 rounded-[2rem] border-2 border-primary/20 bg-white/90 p-6 shadow-2xl backdrop-blur-md strawberry-shadow">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container">
            <FileArchive className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight text-on-surface">
              ShelbyShare.zip
            </h4>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-secondary">
              Ready for you!
            </p>
          </div>
        </div>

        <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-primary-container">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 1.5 }}
            className="h-full bg-secondary shadow-[0_0_15px_rgba(255,142,158,0.5)]"
          />
        </div>

        <a
          href="#upload"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] strawberry-shadow"
        >
          Upload now
          <Download className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
}
