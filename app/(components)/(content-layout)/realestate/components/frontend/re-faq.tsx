"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, HelpCircle, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";

const space = Geist({
  subsets: ["latin"],
  variable: "--font-carlito",
  weight: "400",
});

const faqs = [
  {
    question: "How many agents can I add to the system?",
    answer:
      "The agency license supports unlimited agents. Each agent gets their own profile, portfolio, and performance reports. Role-based access control per department lets you manage permissions precisely.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use bank-level 256-bit SSL encryption. Client and property data is stored in geographically distributed, secure data centers. Our infrastructure is fully GDPR-compliant and undergoes regular security audits.",
  },
  {
    question: "Can I import my existing property data?",
    answer:
      "Absolutely. You can upload Excel and CSV files through our import tool. Our onboarding team will help you migrate your existing database seamlessly.",
  },
  {
    question: "How are contracts and payment plans managed?",
    answer:
      "Each contract gets a customizable payment schedule: down payment, installment dates and amounts, deposit info. Automatic reminders are sent when payments are overdue and statuses stay up to date.",
  },
  {
    question: "I have multiple branches — can I manage them all?",
    answer:
      "Yes. We support multi-office structures. You can manage separate departments and agents for each branch and monitor all branches from a centralized reporting dashboard.",
  },
  {
    question: "Can my clients access the system?",
    answer:
      "With the optional client portal module, you can give clients access to view listings, track visit requests, and download contract documents.",
  },
  {
    question: "Does it work on mobile devices?",
    answer:
      "The platform is fully responsive and works seamlessly on smartphones and tablets. Dedicated iOS and Android apps are coming soon.",
  },
  {
    question: "How is technical support provided?",
    answer:
      "We offer 24/7 live chat, email, and phone support. A dedicated customer success manager is assigned during onboarding to guide you through every step of the setup.",
  },
];

export default function REFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative overflow-hidden py-10 px-4 sm:py-14 sm:px-6 md:py-22 text-foreground">
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1 }}
      >
        <div className="group relative mb-2 inline-block cursor-pointer rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold text-sky-700 shadow">
          ❓ Frequently Asked Questions
        </div>
      </motion.div>

      <div className="absolute -top-10 left-1/2 h-full w-3/4 -translate-x-1/2 select-none rounded-3xl bg-primary/10 opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-all ease-in-out" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mt-5 mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <motion.h1
          className={cn(
            "font-bold tracking-tighter text-black sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto text-center text-4xl xl:text-6xl/none",
            space.className,
          )}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          Frequently Asked Questions
        </motion.h1>

        <motion.p
          className="mx-auto max-w-3xl text-center text-base sm:text-xl text-muted-foreground -mt-5"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          The most common questions about Real Estate ERP, answered. Can't find
          what you need? Our support team is happy to help.
        </motion.p>

        <div className="space-y-4 mx-auto max-w-4xl w-full">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                className="w-full text-left p-4 focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <motion.div
          className="mt-8 p-6 rounded-xl border-2 border-secondary/40 shadow-xl bg-card text-card-foreground max-w-4xl w-full"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <HelpCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
              <span className="text-foreground font-medium">
                Still have questions about Real Estate ERP?
              </span>
            </div>
            <Link
              href="/contact-us"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 flex items-center whitespace-nowrap font-medium shadow-lg hover:shadow-xl group"
            >
              Contact our team
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
