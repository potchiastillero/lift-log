"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAscendStore } from "@/lib/ascend/store";
import { Button } from "@/components/ui/button";

export function LevelUpModal() {
  const levelUp = useAscendStore((state) => state.activeLevelUp);
  const dismissLevelUp = useAscendStore((state) => state.dismissLevelUp);

  return (
    <AnimatePresence>
      {levelUp ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#02050d]/70 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="panel relative w-full max-w-md overflow-hidden rounded-[32px] p-8 text-center"
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(110,182,255,0.35),transparent_70%)]" />
            <div className="relative">
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full border border-white/12 bg-white/6 shadow-[0_12px_40px_rgba(110,182,255,0.25)]">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.34em] text-accent">System update</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-foreground">Level {levelUp.level}</h2>
              <p className="mt-3 text-base text-muted-strong">{levelUp.tier} unlocked</p>
              <p className="mt-5 text-sm leading-7 text-muted">
                Clean execution compounds. You converted this action into +{levelUp.gainedExperience} experience and advanced your profile.
              </p>
              <Button onClick={dismissLevelUp} className="mt-8 w-full">
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
