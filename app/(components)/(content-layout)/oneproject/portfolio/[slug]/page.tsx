import { getPortfolioByUserId } from "../../actions/portfolio";


import { getUserPublicFeaturedProjects,getUserPublicOtherProjects } from "../../actions/projects";
import Portfolio from "../../components/PortFolioPage";
import { notFound } from "next/navigation";
import React from "react";

export default async function page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id = "" } = searchParams;
  if (!id) {
    return notFound();
  }
  const featured = (await getUserPublicFeaturedProjects(id as string)) || [];
  const otherProjects = (await getUserPublicOtherProjects(id as string)) || [];

  const profile = await getPortfolioByUserId(id as string);
  return (
    <div>
      {profile && profile.id && (
        <Portfolio
          otherProjects={otherProjects}
          profile={profile}
          projects={featured}
        />
      )}
    </div>
  );
}
