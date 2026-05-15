"use client";

import { BarChart2, Building2, FileSignature, Users } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import Image from "next/image";

const space = Geist({
  subsets: ["latin"],
  variable: "--font-carlito",
  weight: "400",
});

const features = [
  {
    icon: Building2,
    tab: "Properties",
    title: "🏠 Property & Listing Management",
    description:
      "Manage your for-sale and for-rent portfolio in a comprehensive database with area, location, features, and images.",
    href: "/features/properties",
    subFeatures: [
      "Detailed property profiles (gross/net area, room count, floor)",
      "Photo gallery and cover image management",
      "Map-based location pinning (latitude/longitude)",
      "Property status tracking (Available, Listed, Rented/Sold)",
      "Owner details and national ID records",
      "Quick search by listing number",
      "Featured property flagging",
      "Attached documents and title deed info",
    ],
    image:
      "https://img.freepik.com/free-vector/admin-dashboard-panel-template-with-flat-design_23-2147868394.jpg",
  },
  {
    icon: Users,
    tab: "Agents",
    title: "👤 Agent & Client Portal",
    description:
      "Organize all your agents by department, manage client profiles, and strengthen relationships.",
    href: "/features/agents",
    subFeatures: [
      "Agent profile: employee ID, license, commission rate",
      "Department-based org chart",
      "Specialization: city and property type filters",
      "Attendance and leave management",
      "Buyer, seller, tenant, landlord client types",
      "Client budget and preference profiles",
      "Favorited listings and priority ranking",
      "Client preferred contact method settings",
    ],
    image:
      "https://img.freepik.com/free-vector/flat-university-background_23-2148168523.jpg",
  },
  {
    icon: FileSignature,
    tab: "Contracts",
    title: "📝 Contracts & Payment Plans",
    description:
      "Create sale and rental contracts, track all payments, and manage documents from one place.",
    href: "/features/contracts",
    subFeatures: [
      "Sale and rental contract types",
      "Contract status: Draft, Active, Completed",
      "Flexible payment plans: down payment and installments",
      "Payment methods: cash, bank transfer, cheque",
      "Automatic payment reminders",
      "Document uploads: title deed, lease agreement, etc.",
      "Agent and client commission calculations",
      "Contract expiry notifications",
    ],
    image:
      "https://img.freepik.com/premium-photo/collection-colorful-pencils-pens-pencils-are-arranged-circle_1292816-2183.jpg",
  },
  {
    icon: BarChart2,
    tab: "Analytics",
    title: "📊 Reports & Analytics",
    description:
      "Make data-driven decisions with powerful reports and dashboards that measure your office's performance.",
    href: "/features/analytics",
    subFeatures: [
      "Agency-wide property and listing summary",
      "Agent-level sales and rental performance",
      "Contract closing times and conversion rates",
      "Client satisfaction scores (1–5 stars)",
      "Department budget and expense tracking",
      "Commission revenue projections",
      "Visit & offer conversion funnel",
      "CSV/Excel report exports",
    ],
    image:
      "https://img.freepik.com/premium-photo/purple-tablet-with-graph-it-graph-it_1197721-134076.jpg",
  },
];

export default function RETabbedFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="advanced-features"
      className="relative overflow-hidden py-10 px-4 sm:px-6 md:px-10 text-foreground bg-white"
    >
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.1 }}
      >
        <div className="group relative mb-2 inline-block cursor-pointer rounded-full bg-slate-200 px-4 py-1 text-xs font-semibold text-sky-700 shadow">
          🔑 Advanced Features
        </div>
      </motion.div>

      <div className="absolute -top-10 left-1/2 h-20 w-3/4 -translate-x-1/2 select-none rounded-full bg-primary opacity-40 blur-3xl pointer-events-none bg-gradient-to-b from-primary/20 to-transparent" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-10"
      >
        <motion.h1
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black font-bold tracking-tight text-center",
            space.className,
          )}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2 }}
        >
          All the Powerful Features of Real Estate ERP
        </motion.h1>

        <motion.p
          className="max-w-2xl text-center text-base sm:text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.3 }}
        >
          Take your office to the next level with integrated modules covering
          every workflow a modern real estate agency needs.
        </motion.p>

        <Tabs defaultValue={features[0].tab} className="w-full">
          <TabsList className="inline-flex w-full overflow-x-auto whitespace-nowrap rounded-none border-b bg-transparent p-2 gap-2 sm:justify-center sm:gap-4 sm:p-0 scrollbar-hide">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.tab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TabsTrigger
                    value={feature.tab}
                    className="flex items-center gap-2 border-b-2 border-transparent px-4 pb-2 pt-1 text-sm sm:text-base data-[state=active]:border-primary transition-all duration-300 hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                    {feature.tab}
                  </TabsTrigger>
                </motion.div>
              );
            })}
          </TabsList>

          {features.map((feature) => (
            <TabsContent
              key={feature.tab}
              value={feature.tab}
              className="space-y-8"
            >
              <motion.div
                className="grid grid-cols-1 gap-10 md:grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-6">
                  <motion.h2
                    className="text-2xl sm:text-3xl font-bold"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {feature.title}
                  </motion.h2>

                  <motion.p
                    className="text-base sm:text-lg text-muted-foreground"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {feature.description}
                  </motion.p>

                  <Card className="border-2 border-secondary/40 shadow-xl">
                    <CardContent className="grid gap-4 p-6">
                      {feature.subFeatures.map((subFeature, subIndex) => (
                        <motion.div
                          key={subIndex}
                          className="flex items-center gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + subIndex * 0.1,
                          }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                            {subIndex + 1}
                          </div>
                          <span className="text-sm">{subFeature}</span>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  <Button
                    asChild
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-300"
                  >
                    <a href={feature.href}>Learn more about {feature.title}</a>
                  </Button>
                </div>

                <motion.div
                  className="relative aspect-video sm:aspect-square overflow-hidden rounded-xl bg-muted shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Image
                    src={feature.image}
                    alt={`${feature.title} illustration`}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </section>
  );
}
