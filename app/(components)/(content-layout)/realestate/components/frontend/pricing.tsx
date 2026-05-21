"use client";

import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "next-themes";
import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Check, Star, Zap } from "lucide-react";
import SectionHeader from "./section-header";
import FeaturesBadge from "../ui/features-badge";
import PricingBadge from "../ui/pricing-badge";

const space = Geist({
  subsets: ["latin"],
  variable: "--font-carlito",
  weight: "400",
});

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { theme } = useTheme();

  // Pricing per student per month/year
  const monthlyPrice = 4;
  const annualPrice = 40; // ~17% savings annually

  const features = [
    "Complete Student Management System",
    "Academic & Examination Tools",
    "Parent-Teacher Communication Platform",
    "Basic Financial Management",
    "Attendance Tracking System",
    "Real-time Notifications",
    "24/7 Customer Support",
    "Regular System Updates",
  ];

  const pricingHighlights = [
    {
      icon: Star,
      title: "All Features Included",
      description: "No hidden fees or premium tiers",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Get started in minutes, not weeks",
    },
    {
      icon: Check,
      title: "Volume Discounts",
      description: "Special rates for large institutions",
    },
  ];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-10 px-4 sm:py-14 sm:px-6 md:py-22 text-foreground"
    >
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1 }}
      >
        <PricingBadge />
      </motion.div>

      <div className="absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 select-none rounded-full bg-primary opacity-40 blur-3xl"></div>
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-all ease-in-out"></div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mt-5 mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <motion.h1
          className={cn(
            "font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto text-center text-4xl xl:text-6xl/none text-black",
            space.className,
          )}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          Pricing
        </motion.h1>

        <motion.p
          className="mx-auto max-w-3xl text-center text-base sm:text-xl text-muted-foreground -mt-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          Simple, predictable pricing that grows with your institution. All
          features included, no hidden fees. Special discounts available for
          large institutions.
        </motion.p>

        {/* Pricing Toggle */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 p-1 bg-secondary/20 rounded-xl border border-secondary/40"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant={isAnnual ? "outline" : "default"}
            onClick={() => setIsAnnual(false)}
            className="transition-all duration-300"
          >
            Monthly
          </Button>
          <Button
            variant={isAnnual ? "default" : "outline"}
            onClick={() => setIsAnnual(true)}
            className="transition-all duration-300"
          >
            Annually (Save 17%)
          </Button>
        </motion.div>

        {/* Pricing Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl w-full">
          {pricingHighlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary/10 border border-secondary/30"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{highlight.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Pricing Card */}
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="border-2 border-secondary/40 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Features Section */}
                <div className="p-8 sm:p-10 lg:p-12 bg-background">
                  <motion.h3
                    className="text-2xl font-bold tracking-tight mb-6"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    {isAnnual ? "Annual" : "Monthly"} School License
                  </motion.h3>

                  <motion.p
                    className="text-base leading-7 text-muted-foreground mb-8"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    Get complete access to our comprehensive school management
                    system with all features included. Perfect for schools of
                    any size with flexible scaling options.
                  </motion.p>

                  <motion.div
                    className="flex items-center gap-x-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    <h4 className="flex-none text-lg font-semibold leading-6 text-primary">
                      Everything you need included
                    </h4>
                    <div className="h-px flex-auto bg-secondary/50"></div>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1 + index * 0.1 }}
                      >
                        <div className="flex-none w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-secondary/5 p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-l border-secondary/20">
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <div className="mb-6">
                      <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                        {isAnnual
                          ? "💎 Pay yearly, save 17%"
                          : "🚀 Simple per-student pricing"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-center gap-x-2 mb-8">
                      <span className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        ${isAnnual ? annualPrice : monthlyPrice}
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                          USD
                        </span>
                        <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                          /student{!isAnnual && "/month"}
                        </span>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Start Free Trial
                      </Button>
                    </motion.div>

                    <p className="mt-6 text-xs leading-5 text-muted-foreground">
                      ⚡ 14-day free trial • 💳 No credit card required • 🎊
                      Volume discounts available
                    </p>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        {/* <motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mt-12"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 1.4 }}
				>
					<div className="text-center">
						<div className="text-2xl font-bold text-primary mb-2">500+</div>
						<div className="text-sm text-muted-foreground">
							Schools Trust Us
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-primary mb-2">99.9%</div>
						<div className="text-sm text-muted-foreground">
							Uptime Guarantee
						</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-primary mb-2">24/7</div>
						<div className="text-sm text-muted-foreground">
							Support Available
						</div>
					</div>
				</motion.div> */}
      </motion.div>
    </section>
  );
}
