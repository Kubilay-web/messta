"use client";

import { Geist } from "next/font/google";
import { cn } from "../../lib/utils";
import {
	ArrowRight,
	Star,
	Users,
	Zap,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { CardHoverEffect } from "../ui/pulse-card";
import { Beam } from "../ui/gridbeam";
import CtaBadge from "../ui/cta-badge";

const space = Geist({
	subsets: ["latin"],
	variable: "--font-carlito",
	weight: "400",
});

export default function CTA() {
	const benefits = [
		{
			title: "10,000+ Schools",
			description: "Trusted by educational institutions worldwide",
			icon: <Users className="h-full w-full" />,
			variant: "purple",
			showGridLines: true,
		},
		{
			title: "99.9% Uptime",
			description: "Reliable performance when you need it most",
			icon: <Zap className="h-full w-full" />,
			variant: "emerald",
			showGridLines: true,
		},
		{
			title: "5-Star Rated",
			description: "Top-rated by administrators and teachers",
			icon: <Star className="h-full w-full" />,
			variant: "amber",
			showGridLines: true,
		},
	] as const;

	const features = [
		"Complete student management system",
		"Real-time grade tracking and reporting",
		"Parent-teacher communication portal",
		"Automated attendance management",
		"Integrated payment processing",
		"Multi-campus support",
	];

	return (
		<div className="relative bg-black/20 rounded-3xl w-full overflow-x-hidden py-12 px-4 sm:py-16 sm:px-6 md:py-20">
			{/* Background Effects */}
			<div className="absolute inset-0 -z-10">
				{/* Animated gradient blobs */}
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-green-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>

				{/* Grid pattern */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
			</div>

			<div className="container mx-auto px-4 2xl:max-w-[1400px]">
				{/* Main CTA Content */}
				<div className="mx-auto max-w-4xl text-center">
					<Beam />

					{/* Badge */}
					<CtaBadge />

					{/* Main Heading */}
					<motion.h2
						className={cn(
							"font-bold tracking-tighter mt-5 sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-center text-4xl text-transparent xl:text-6xl/none mb-6",
							space.className
						)}
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.75, delay: 0.1 }}
						viewport={{ once: true }}
					>
						Ready to Transform Your{" "}
						<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
							School Management?
						</span>
					</motion.h2>

					{/* Subtitle */}
					<motion.p
						className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.75, delay: 0.2 }}
						viewport={{ once: true }}
					>
						Join thousands of schools worldwide who have streamlined their
						operations with School Pro. Start your free trial today and see the
						difference.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.75, delay: 0.4 }}
						viewport={{ once: true }}
					>
						<Link href="/signup" className="w-full sm:w-auto">
							<Button
								size="lg"
								className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-base sm:text-lg group"
							>
								Start Free Trial
								<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
							</Button>
						</Link>
						<Link href="/demo" className="w-full sm:w-auto">
							<Button
								variant="outline"
								size="lg"
								className="w-full sm:w-auto border-2 hover:bg-muted/50 px-8 py-4 text-base sm:text-lg"
							>
								Watch Demo
							</Button>
						</Link>
					</motion.div>
				</div>

				{/* Benefits Cards */}
				{/* <motion.div
					className="mx-auto max-w-5xl"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, delay: 0.6 }}
					viewport={{ once: true }}
				>
					<div className="flex flex-col items-center justify-center gap-8 sm:flex-row">
						{benefits.map((benefit, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
								viewport={{ once: true }}
							>
								<CardHoverEffect
									title={benefit.title}
									description={benefit.description}
									icon={benefit.icon}
									variant={benefit.variant}
									glowEffect={true}
									size="lg"
									showGridLines={benefit.showGridLines}
								/>
							</motion.div>
						))}
					</div>
				</motion.div> */}

				{/* Bottom CTA */}
				{/* <motion.div
					className="mx-auto max-w-2xl text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 border border-blue-500/10"
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.75, delay: 0.8 }}
					viewport={{ once: true }}
				>
					<h3 className="text-2xl font-bold mb-4">
						Questions? We're here to help!
					</h3>
					<p className="text-muted-foreground mb-6">
						Our team of education technology experts is ready to guide you
						through the setup process and help you get the most out of School
						Pro.
					</p>
					<Link href="/contact">
						<Button variant="outline" className="group">
							Contact Sales Team
							<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
						</Button>
					</Link>
				</motion.div> */}
			</div>
		</div>
	);
}
