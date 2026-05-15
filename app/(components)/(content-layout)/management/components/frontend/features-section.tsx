"use client";

import { useTheme } from "next-themes";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import FeaturesBadge from "../ui/features-badge";
import Image from "next/image";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-carlito",
    weight: "400",
});

const schoolProFeatures = [
    {
        title: "📚 Academic Dashboard",
        description:
            "Centralized access to attendance, grades, schedules, and class materials for both students and staff.",
        image:
            "https://img.freepik.com/free-vector/admin-dashboard-panel-template-with-flat-design_23-2147868394.jpg?w=740",
    },
    {
        title: "📝 Exam Management",
        description:
            "Plan, schedule, and publish exams with automated grading and real-time analytics.",
        image:
            "https://img.freepik.com/free-vector/flat-university-background_23-2148168523.jpg?w=740",
    },
    {
        title: "📖 Learning Materials",
        description:
            "Upload and organize course notes, e-books, assignments, and videos in structured modules.",
        image:
            "https://img.freepik.com/premium-photo/collection-colorful-pencils-pens-pencils-are-arranged-circle_1292816-2183.jpg?w=740",
    },
    {
        title: "👩‍🏫 Teacher Portal",
        description:
            "A complete teaching toolkit with class lists, performance tracking, and communication tools.",
        image:
            "https://img.freepik.com/free-vector/online-learning-concept-illustration_114360-4755.jpg?w=740",
    },
    {
        title: "📊 Reports & Analytics",
        description:
            "Visualize academic performance, attendance, and system usage with intelligent reports.",
        image:
            "https://img.freepik.com/premium-photo/purple-tablet-with-graph-it-graph-it_1197721-134076.jpg?w=740",
    },
    {
        title: "🔔 Notifications & Alerts",
        description:
            "Automated reminders for upcoming exams, events, or announcements via SMS and email.",
        image:
            "https://img.freepik.com/free-vector/3d-vector-yellow-bell-alert-symbol-social-media-red-exclamation-mark-notification-icon-isolated_40876-3504.jpg?w=740",
    },
];

export default function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });
    const { theme } = useTheme();
    const [isHovering, setIsHovering] = useState(false);

    const [baseColor, setBaseColor] = useState<[number, number, number]>(
        theme === "dark" ? [1, 0, 0.3] : [1, 1, 1]
    );

    const [glowColor, setGlowColor] = useState<[number, number, number]>(
        theme === "dark" ? [1, 0, 0.4] : [1, 0.3, 0.4]
    );

    const [dark, setDark] = useState<number>(theme === "dark" ? 1 : 0);

    useEffect(() => {
        if (theme === "dark") {
            setBaseColor([1, 0, 0.3]);
            setDark(1);
            setGlowColor([1, 0, 0.4]);
        } else {
            setBaseColor([1, 1, 1]);
            setDark(0);
            setGlowColor([1, 0.3, 0.4]);
        }
    }, [theme]);

    return (
        <section
            id="features"
            className="relative w-full bg-white py-12 sm:py-16 md:py-20 lg:py-24"
        >
            {/* Background gradient glow - relative positioning without absolute */}
            <div className="relative w-full overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Subtle background glow container */}
                    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute left-1/2 top-10 h-32 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-40 sm:w-[500px] md:top-20 md:h-56 md:w-[600px] lg:h-72 lg:w-[800px]"></div>
                        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl sm:h-56 sm:w-56 md:h-80 md:w-80"></div>
                        <div className="absolute right-0 top-1/2 h-40 w-40 rounded-full bg-primary/5 blur-2xl sm:h-56 sm:w-56 md:h-80 md:w-80"></div>
                    </div>

                    {/* Decorative top line - relative positioned */}
                    <div className="relative mx-auto mb-12 w-full max-w-7xl">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
                    </div>

                    <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                    >
                        <FeaturesBadge />
                    </motion.div>

                    <motion.div
                        ref={ref}
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 flex flex-col items-center gap-6 sm:mt-10 sm:gap-8 md:mt-12 lg:mt-16"
                    >
                        <motion.h1
                            className={cn(
                                "text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl",
                                "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent",
                                "dark:from-gray-100 dark:via-gray-200 dark:to-gray-100",
                                geist.className
                            )}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.2 }}
                        >
                            All-in-One School Management Platform
                        </motion.h1>

                        <motion.p
                            className="mx-auto max-w-2xl text-center text-base text-gray-600 dark:text-gray-300 sm:text-lg md:text-xl"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, delay: 0.3 }}
                        >
                            Streamline your entire school operations with our comprehensive
                            suite of integrated modules designed for modern education.
                        </motion.p>

                        <div className="mt-6 w-full max-w-7xl">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {schoolProFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50 sm:p-6"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        viewport={{ once: true }}
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                                            {feature.description}
                                        </p>
                                        <div className="mt-4 flex items-center justify-center sm:mt-6">
                                            <div className="relative w-full max-w-[280px] overflow-hidden rounded-lg">
                                                <Image
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    width={300}
                                                    height={300}
                                                    className="h-auto w-full rounded-md object-contain transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}