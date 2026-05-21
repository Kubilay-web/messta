"use client";
import useSchoolStore from "../store/school";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo({
	variant = "light",
	size = "md",
	href = "/management",
}: {
	variant?: "dark" | "light";
	size?: "sm" | "md" | "lg";
	href?: string;
}) {
	const { school: company } = useSchoolStore();
	if (variant === "light") {
		return (
			<Link href={href} className="flex items-center space-x-2">
				<Image
					alt={company?.name ?? "Estate Pro"}
					src={company?.logo ?? "/management/images/logo.png"}
					width={500}
					height={150}
					className="w-44"
				/>
			</Link>
		);
	} else {
		return (
			<Link href={"/management"} className="flex items-center space-x-2">
				<Image
					alt={company?.name ?? "Estate Pro"}
					src={company?.logo ?? "/management/images/logo.png"}
					width={500}
					height={150}
					className="w-44"
				/>
			</Link>
		);
	}
}
