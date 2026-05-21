import RECTA from "../components/frontend/re-cta";
import REFAQ from "../components/frontend/re-faq";
import REFeatures from "../components/frontend/re-features";
import REHero from "../components/frontend/re-hero";
import REPricing from "../components/frontend/re-pricing";
import REStats from "../components/frontend/re-stats";
import RETabbedFeatures from "../components/frontend/re-tabbed-features";
import React from "react";

export default function Home() {
	return (
		<main className="w-full overflow-x-hidden">
			<REHero />
			<REStats />
			<REFeatures />
			<RETabbedFeatures />
			<div className="p-4">
				<RECTA />
			</div>
			<REPricing />
			<REFAQ />
		</main>
	);
}
