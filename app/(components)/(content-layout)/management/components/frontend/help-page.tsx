"use client";
import * as React from "react";
import { Search, Mail, Phone, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import Link from "next/link";

const articles = [
  {
    id: 1,
    title: "Getting Started Guide",
    excerpt: "Learn the basics of using our platform",
    category: "Basics",
  },
  {
    id: 2,
    title: "Account Management",
    excerpt: "How to manage your account settings",
    category: "Account",
  },
  {
    id: 3,
    title: "Troubleshooting Common Issues",
    excerpt: "Solutions to frequent problems",
    category: "Support",
  },
];

const faqs = [
  {
    question: "What is SchoolPro?",
    answer:
      "SchoolPro is a comprehensive online school management system designed to streamline educational administration. It provides tools for managing admissions, student information, scheduling, grading, and more—all accessible anytime, anywhere through the internet.",
  },
  {
    question: "Can SchoolPro adapt to my school's unique requirements?",
    answer:
      "Yes! SchoolPro is highly flexible and can be adapted to various educational systems. You can customize grading criteria, class levels, timetables, and report cards within minutes. We'll help you set everything up during your free trial period.",
  },
  {
    question: "What are the system requirements for using SchoolPro?",
    answer:
      "SchoolPro is web-based and requires only a modern web browser that supports HTML5, such as Google Chrome, Mozilla Firefox, or Microsoft Edge. No additional software installation is needed.",
  },
  {
    question: "How can I migrate my existing school data to SchoolPro?",
    answer:
      "SchoolPro provides a simple data migration process. You can import your existing data using Microsoft Excel (.xls) files. Our system offers a step-by-step guide to ensure smooth data transfer.",
  },
  {
    question: "What kind of support does SchoolPro offer?",
    answer:
      "We provide comprehensive technical support via email, phone, and live chat during weekdays. Our support team is ready to assist you with any questions or technical issues you may encounter, completely free of charge.",
  },
  {
    question: "Do I need expensive training to use SchoolPro?",
    answer:
      "No. SchoolPro is designed with an intuitive interface that's easy to use from day one. We provide free access to video tutorials and documentation. Our support team is also available to guide you through any features you need help with.",
  },
  {
    question: "How much does SchoolPro cost?",
    answer:
      "We offer flexible, student-based pricing plans to suit schools of all sizes. Our pricing is transparent with no hidden fees. Contact our sales team for a customized quote based on your school's specific needs.",
  },
  {
    question: "Is there a long-term contract requirement?",
    answer:
      "No. We operate on a monthly subscription basis, and you can cancel your subscription with a one-month notice. We believe in earning your business every month through our service quality.",
  },
  {
    question: "How does SchoolPro ensure my school's data security?",
    answer:
      "We take data security seriously. Your school's data is automatically backed up daily to secure locations. We use bank-grade SSL encryption for all data transmissions and store data in world-class data centers with 99.9% uptime guarantee.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, MasterCard, and American Express. All payments are processed securely through our payment gateway partner, and we accept payments in multiple currencies.",
  },
  {
    question: "Can SchoolPro be installed on our school's servers?",
    answer:
      "SchoolPro is a cloud-based solution, which means you don't need to worry about server maintenance, updates, or backups. This allows us to provide continuous upgrades, reliable service, and immediate support to all users.",
  },
  {
    question: "Do you offer custom feature development?",
    answer:
      "While we don't develop custom features for individual schools, we regularly update our platform based on user feedback and common requirements. We encourage you to share your needs with us as they may be included in future updates at no additional cost.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Articles Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Help Articles</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <Link href="#" key={article.id}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16 bg-blue-50 p-8 rounded-lg">
        <div className="text-center mb-8">
          <h3 className="text-blue-500 font-medium mb-2">
            FREQUENTLY ASKED QUESTIONS
          </h3>
          <h2 className="text-3xl font-bold">
            You ask? We <span className="italic">answer</span>
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
          <span>Need further support?</span>
          <Button variant="link" className="text-green-500 font-medium">
            Contact us
          </Button>
        </div>
      </section>

      {/* Contact Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Email Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get in touch with our support team via email
              </p>
              <Button className="w-full" variant="outline">
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time
              </p>
              <Button className="w-full" variant="outline">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Phone Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Call us directly for immediate assistance
              </p>
              <Button className="w-full" variant="outline">
                Call Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
