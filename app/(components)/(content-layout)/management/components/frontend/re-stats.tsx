"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, FileSignature, MapPin, Users } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "50,000+",
    label: "Properties Managed",
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    icon: Users,
    value: "8,500+",
    label: "Active Agents",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: FileSignature,
    value: "120,000+",
    label: "Contracts Closed",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: MapPin,
    value: "81",
    label: "Cities Covered",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function REStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative w-full bg-gradient-to-b from-white to-slate-50 py-14 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          className="grid grid-cols-2 gap-6 sm:grid-cols-4"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
