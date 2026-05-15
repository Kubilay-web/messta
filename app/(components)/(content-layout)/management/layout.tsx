import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

const inter = Rethink_Sans({
	subsets: ["latin"],
	display: "swap",
});


import { ourFileRouter } from "./api/uploadthing/core";
import { Toaster } from "react-hot-toast";
import { Toaster as SoonerToaster } from "./components/ui/sonner";
import { siteConfig } from "./config/site";

export const metadata: Metadata = {
	title: {
		default: siteConfig.title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	keywords: [
		"school management system",
		"education software",
		"student portal",
		"teacher dashboard",
		"class scheduling",
		"online attendance",
		"school fees tracking",
		"parent-teacher communication",
		"school ERP",
		"e-learning platform",
	],
	authors: [
		{
			name: "School Pro Team",
			url: siteConfig.url,
		},
	],
	alternates: {
		canonical: siteConfig.url,
		languages: {
			"en-US": `${siteConfig.url}/en-US`,
		},
	},
	creator: "School Pro",
	publisher: "School Pro",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteConfig.url,
		title: siteConfig.title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: `${siteConfig.name} Open Graph Image`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteConfig.title,
		description: siteConfig.description,
		images: [siteConfig.ogImage],
		creator: "@schoolproapp", // Replace with actual Twitter handle
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div>
			<div className={inter.className}>
				<Toaster position="top-center" reverseOrder={false} />
				<SoonerToaster richColors />
				<NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
				{children}
			</div>
		</div>
	);
}
