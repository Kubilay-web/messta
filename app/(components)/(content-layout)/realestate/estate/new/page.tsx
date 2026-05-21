import { validateRequest } from "@/app/auth";
import { getServerUser } from "../../actions/auth";
import SchoolOnboardingForm from "../../components/dashboard/forms/school/school-onboarding-form";

import { Card, CardContent } from "../../components/ui/card";

import React from "react";

export default async function page() {


	const {user} = await validateRequest();


	// if (!user || role !== "SUPER_ADMIN") {
	// 	redirect("/login");
	// }


	return (
		<div>
			<Card className="border-t-4 border-blue-600 shadow">
				<CardContent className="p-6">
					<SchoolOnboardingForm />
				</CardContent>
			</Card>
		</div>
	);
}
