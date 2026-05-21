"use client";

import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import { Building2, FileText, MoveRight, Users } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Beam } from "../ui/gridbeam";
import { CardHoverEffect } from "../ui/pulse-card";

const space = Geist({
  subsets: ["latin"],
  variable: "--font-carlito",
  weight: "400",
});

const cards = [
  {
    title: "Property & Listing Management",
    description: "Manage your entire portfolio from one screen.",
    icon: <Building2 className="h-full w-full" />,
    variant: "blue",
    showGridLines: true,
  },
  {
    title: "Agents & Clients",
    description: "Track your team and clients effectively.",
    icon: <Users className="h-full w-full" />,
    variant: "blue",
    showGridLines: true,
  },
  {
    title: "Contracts & Payments",
    description: "Close sales and rental deals faster.",
    icon: <FileText className="h-full w-full" />,
    variant: "blue",
    showGridLines: true,
  },
] as const;

export default function REHero() {
  return (
    <div
      id="hero-section"
      className="relative min-h-screen w-full overflow-x-hidden bg-background py-12 px-4 sm:py-16 sm:px-6 md:py-20"
    >
      <div className="container mx-auto px-4 2xl:max-w-[1400px]">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <div className="group relative mb-2 inline-block cursor-pointer rounded-full bg-slate-300 p-px text-xs font-semibold leading-6 no-underline shadow-2xl shadow-zinc-900 dark:bg-slate-900">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(248,56,110,0.6)_0%,rgba(56,189,248,0)_75%)]" />
            </span>
            <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-100 px-4 py-0.5 ring-1 ring-ring/10 dark:bg-zinc-950">
              <span>🏠 Welcome to Real Estate ERP</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <motion.path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              </svg>
            </div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-rose-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </div>
        </motion.div>

        <div className="mx-auto mt-5 max-w-3xl text-center">
          <Beam />
          <motion.h1
            className={cn(
              "font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-black max-w-3xl mx-auto text-center text-4xl xl:text-6xl/none",
              space.className,
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2 }}
          >
            Your Complete Real Estate Agency Management Solution
          </motion.h1>
        </div>

        <motion.div
          className="mx-auto mt-5 max-w-3xl text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          <p className="text-base sm:text-xl text-muted-foreground">
            From property to contract, agent to client — manage every real estate
            workflow in one platform. Faster closings, higher commissions.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.4 }}
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-b from-sky-500 to-sky-700 text-sm text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]">
              Get Started Free
            </Button>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Watch Demo <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="mx-auto mt-5 max-w-3xl text-center">
          <main className="m-auto flex w-full flex-col items-center justify-center gap-8 bg-background p-6 text-left text-gray-800 dark:bg-background dark:text-[#e3e3e3] sm:flex-row xl:p-4">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.25 }}
              >
                <CardHoverEffect
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  variant={card.variant}
                  glowEffect={true}
                  size="lg"
                  showGridLines={card.showGridLines}
                />
              </motion.div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
