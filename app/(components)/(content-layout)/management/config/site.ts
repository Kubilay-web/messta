const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const siteConfig = {
	name: "SchoolPro",
	title: "SchoolPro - Smart School Management Made Simple",
	url: baseUrl,
	ogImage:
		"https://res.cloudinary.com/dwzcrgcu1/image/upload/v1750557671/SchoolPro_1_buidny.png",
	description:
		"School Pro is a modern school management system designed to simplify administration, enhance communication, and empower teachers, students, and parents. Built for performance, accessibility, and ease of use.",
	links: {
		twitter: "https://twitter.com/schoolproapp",
		github: "https://github.com/yourusername/school-pro",
	},
};

export type SiteConfig = typeof siteConfig;
