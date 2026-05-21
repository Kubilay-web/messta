"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "./ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import {
	DollarSign,
	Bell,
	Menu,
	Users,
	Building2,
	MessageSquare,
	Key,
	Map,
	BarChart2,
	Home,
	CalendarDays,
	FileText,
	Shield,
} from "lucide-react";
import { cn } from "../lib/utils";
import { ChevronDown } from "lucide-react";
import Logo from "./logo";
// import PromoBanner from "./promo-banner";
import Header2 from "./site-header-i";

const features = [
	{
		icon: Building2,
		title: "Property Management",
		description:
			"Comprehensive property information system for managing listings, ownership records, and property details with ease",
		href: "/features/property-management",
	},
	{
		icon: Home,
		title: "Listing Management",
		description:
			"Streamline property listings, search filters, availability tracking, and listing publication in one unified system",
		href: "/features/listing-management",
	},
	{
		icon: MessageSquare,
		title: "Client Communication",
		description:
			"Integrated messaging system with multi-channel notifications for seamless client and agent communication",
		href: "/features/communication",
	},
	{
		icon: DollarSign,
		title: "Financial Management",
		description:
			"Complete rent collection, invoice management, online payments, and comprehensive financial reporting",
		href: "/features/finance",
	},
	{
		icon: Users,
		title: "Agent Management",
		description:
			"Efficient tools for managing agent profiles, performance tracking, commission calculations, and payroll",
		href: "/features/agent-management",
	},
	{
		icon: Map,
		title: "Location & Mapping",
		description:
			"Interactive map-based property search, neighborhood insights, and proximity analysis for informed decisions",
		href: "/features/location-mapping",
	},
	{
		icon: BarChart2,
		title: "Analytics & Reports",
		description:
			"Powerful analytics tools for market trends, revenue insights, and data-driven real estate decisions",
		href: "/features/analytics",
	},
	{
		icon: Key,
		title: "Lease Management",
		description:
			"Digital lease agreements, renewal tracking, tenant onboarding, and document management in one platform",
		href: "/features/lease-management",
	},
	{
		icon: CalendarDays,
		title: "Appointment Scheduling",
		description:
			"Automated scheduling for property viewings, inspections, and client meetings with instant notifications",
		href: "/features/appointments",
	},
	{
		icon: FileText,
		title: "Contract Management",
		description:
			"Complete contract lifecycle management from drafting to signing with secure digital access",
		href: "/features/contracts",
	},
	{
		icon: Bell,
		title: "Announcements",
		description:
			"Digital announcement board for property updates, market news, and important alerts with targeted distribution",
		href: "/features/announcements",
	},
	{
		icon: Shield,
		title: "Security & Access",
		description:
			"Role-based access control with data encryption and secure backups for complete peace of mind",
		href: "/features/security",
	},
];

export default function SiteHeader() {
	const [open, setOpen] = React.useState(false);
	const [showFeatures, setShowFeatures] = React.useState(false);

	return (
		<header className="top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
			{/* <PromoBanner /> */}
			{/* <div className="container max-w-6xl mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] p-4">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                      <h4 className="text-lg font-medium">Features</h4>
                      <Link
                        href="/features"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 ">
                      {features.map((feature, index) => (
                        <Link
                          key={index}
                          href={`/feature/${feature.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="block group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-muted rounded-md group-hover:bg-muted/80">
                              <feature.icon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <h5 className="font-medium mb-1 group-hover:text-blue-500">
                                {feature.title}
                              </h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium mb-1">Get started</h4>
                          <p className="text-sm text-muted-foreground">
                            Their food sources have decreased, and their numbers
                          </p>
                        </div>
                        <Button asChild variant="secondary">
                          <Link href="/contact-us">Get started</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/#pricing" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/how-it-works" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    How it Works
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button asChild variant="ghost">
            <Link href={"/login"}>Log in</Link>
          </Button>
          <Button>
            <Link href="/management/contact-us">Book Demo</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left">Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Home
              </Link>
              <button
                className="flex items-center justify-between px-4 py-2 text-lg font-medium hover:bg-accent text-left"
                onClick={() => setShowFeatures(!showFeatures)}
              >
                Features
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showFeatures && "rotate-180"
                  )}
                />
              </button>
              {showFeatures && (
                <div className="px-4 py-2 space-y-4">
                  {features.map((feature, index) => (
                    <Link
                      key={index}
                      href={`/feature/${feature.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="flex items-start gap-4 py-2"
                      onClick={() => setOpen(false)}
                    >
                      <div className="p-2 bg-muted rounded-md">
                        <feature.icon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">{feature.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href="/#pricing"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-2 text-lg font-medium hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                How it works
              </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Button>
                <Button className="w-full" onClick={() => setOpen(false)}>
                  Sign up
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div> */}
			<Header2 />
		</header>
	);
}
