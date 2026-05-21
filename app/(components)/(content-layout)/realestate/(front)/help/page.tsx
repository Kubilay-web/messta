import HelpPage from "../../components/frontend/help-page";
import SectionHeader from "../../components/frontend/section-header";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Help & Support - School Pro",
	description:
		"Need help with School Pro? Find answers to frequently asked questions, troubleshoot issues, and get step-by-step guides on using our school management system effectively.",
};

export default function page() {
	return (
		<div className="py-12">
			<SectionHeader
				title=""
				heading="Help Center & Resources"
				description="Find answers, learn best practices, and discover how to get the most out of your SchoolPro system. Browse through our frequently asked questions or explore our helpful articles to enhance your experience."
			/>
			<HelpPage />
		</div>
	);
}
