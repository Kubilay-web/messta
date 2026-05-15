"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, HelpCircle, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import FaqBadge from "../ui/faq-badge";

const space = Geist({
  subsets: ["latin"],
  variable: "--font-carlito",
  weight: "400",
});

const faqs = [
  {
    question: "How quickly can we get started with SchoolPro?",
    answer:
      "You can get started immediately! Our setup process typically takes 24-48 hours. We'll help you import your existing data, configure your school settings, and train your staff. Most schools are fully operational within a week.",
  },
  {
    question: "Is my school data secure and private?",
    answer:
      "Absolutely. We use bank-level encryption (256-bit SSL) and comply with FERPA, COPPA, and GDPR regulations. Your data is stored in secure, geographically distributed data centers with 24/7 monitoring and regular security audits.",
  },
  {
    question: "Can parents access their child's information?",
    answer:
      "Yes! Parents get their own secure portal where they can view grades, attendance, assignments, school announcements, and communicate directly with teachers. They also receive real-time notifications about their child's progress.",
  },
  {
    question: "What happens if we need help or have technical issues?",
    answer:
      "We provide 24/7 customer support via chat, email, and phone. Our dedicated school success team will help with onboarding, training, and ongoing support. We also offer video tutorials and comprehensive documentation.",
  },
  {
    question: "Can we customize the system for our school's needs?",
    answer:
      "Definitely! SchoolPro is highly customizable. You can add custom fields, create personalized report cards, set up your grading system, configure attendance policies, and even customize the interface with your school colors and logo.",
  },
  {
    question: "How does pricing work for different school sizes?",
    answer:
      "Our pricing is simple: $4 per student per month or $40 per student annually (17% savings). We offer volume discounts for schools with 500+ students and special rates for districts. No setup fees or hidden costs.",
  },
  {
    question: "Can we import our existing student data?",
    answer:
      "Yes! We support data import from Excel, CSV files, and most popular school management systems. Our team will help you migrate all your student records, grades, attendance history, and other important data seamlessly.",
  },
  {
    question: "Does SchoolPro work on mobile devices?",
    answer:
      "Absolutely! SchoolPro is fully responsive and works perfectly on smartphones and tablets. We also offer dedicated mobile apps for iOS and Android, so teachers, parents, and administrators can access everything on the go.",
  },
];

export default function FAQ() {
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
        <FaqBadge />
      </motion.div>
      {/* Background effects */}
      <div className="absolute -top-10 left-1/2 h-full w-3/4 -translate-x-1/2 select-none rounded-3xl bg-primary/10 opacity-40 blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-all ease-in-out"></div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mt-5 mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        {/* Header section */}
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
          Get answers to the most common questions about SchoolPro. Can't find
          what you're looking for? Our support team is here to help!
        </motion.p>

        {/* FAQ Grid */}
        <div className="space-y-4 mx-auto max-w-4xl w-full ">
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

        {/* Call-to-action section */}
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
                Still have questions about Inventory Pro?
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
