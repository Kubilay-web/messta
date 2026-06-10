"use client";

import { BarChart2, DollarSign, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Briefcase,
  MessageCircle,
  FileText,
  Clock,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import SectionHeader from "./section-header";

export const features = [
  {
    icon: Users,
    tab: "Client Management",
    title: "Seamless Client Onboarding",
    description:
      "Streamlined client onboarding and management with real-time collaboration features",
    href: "/features/client-management",
    subFeatures: [
      "Easy client profile creation",
      "Secure client portal access",
      "Real-time project updates",
      "Direct communication channel",
      "Document sharing capabilities",
      "Client feedback system",
      "Custom access permissions",
      "Activity tracking and history",
    ],
    image: "/oneproject/client-onboard.webp",
  },
  {
    icon: Briefcase,
    tab: "Project Planning",
    title: "Dynamic Project Management",
    description:
      "Comprehensive project planning tools with modular organization and progress tracking",
    href: "/features/project-planning",
    subFeatures: [
      "Modular project structure",
      "Task organization and tracking",
      "Progress visualization",
      "Drag-and-drop interface",
      "Timeline management",
      "Resource allocation",
      "Milestone tracking",
      "Project templates",
    ],
    image: "/oneproject/project-manage.webp",
  },
  {
    icon: MessageCircle,
    tab: "Communication",
    title: "Integrated Communication",
    description:
      "Built-in communication tools for seamless client and team collaboration",
    href: "/features/communication",
    subFeatures: [
      "Direct email integration",
      "In-app messaging",
      "Comment threads",
      "notification system",
      "File sharing",
      "Meeting scheduling",
      "Communication history",
      "Team mentions and tags",
    ],
    image: "/oneproject/mail.webp",
  },
  {
    icon: FileText,
    tab: "Invoicing",
    title: "Smart Invoicing System",
    description:
      "Professional invoicing solution with customization and automation features",
    href: "/features/invoicing",
    subFeatures: [
      "One-click invoice generation",
      "Custom branding options",
      "Multiple payment methods",
      "Invoice templates",
      "Payment tracking",
      "Automated reminders",
      "Tax calculation",
      "Financial reporting",
    ],
    image: "/oneproject/paymentForm.webp",
  },
  {
    icon: Clock,
    tab: "Timeline",
    title: "Project Timeline Management",
    description:
      "Visual timeline tools for effective project scheduling and deadline management",
    href: "/features/timeline",
    subFeatures: [
      "Interactive Gantt charts",
      "Deadline tracking",
      "Milestone visualization",
      "Resource timeline",
      "Dependencies mapping",
      "Schedule adjustments",
      "Timeline sharing",
      "Progress indicators",
    ],
    image: "/oneproject/project.webp",
  },
  {
    icon: Wallet,
    tab: "Portfolio",
    title: "Portfolio Showcase",
    description:
      "Professional portfolio generator to showcase your best work and achievements",
    href: "/features/portfolio",
    subFeatures: [
      "Custom portfolio creation",
      "Project highlights",
      "Visual galleries",
      "Client testimonials",
      "Achievement showcase",
      "Responsive design",
      "SEO optimization",
      "Social sharing",
    ],
    image: "/oneproject/portfolio.webp",
  },
];

// Comparison Arrays

export default function TabbedFeatures() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="py-8">
        <SectionHeader
          title=" Features"
          heading="All-in-One Project Management That Works For You"
          description="Take control of your project workflow with our intuitive management system. Seamlessly onboard clients, collaborate in real-time, and automate invoicing—all while maintaining professional oversight of every project detail."
        />
      </div>
      <Tabs defaultValue={features[0].tab.toLowerCase()} className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <TabsTrigger
                key={feature.tab}
                value={feature.tab.toLowerCase()}
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-4 pb-4 pt-2 data-[state=active]:border-primary"
              >
                <Icon className="h-5 w-5" />
                {feature.tab}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {features.map((feature) => (
          <TabsContent
            key={feature.tab}
            value={feature.tab.toLowerCase()}
            className="space-y-8"
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  {feature.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {feature.description}
                </p>
                <Card>
                  <CardContent className="grid gap-4 p-6">
                    {feature.subFeatures.map((subFeature, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {index + 1}
                        </div>
                        <span>{subFeature}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Button asChild>
                  <Link href={feature.href}>
                    Learn more about {feature.title}
                  </Link>
                </Button>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted lg:aspect-square">
                <Image
                  src={feature.image}
                  alt={`${feature.title} illustration`}
                  className="object-contain"
                  fill
                  priority
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
