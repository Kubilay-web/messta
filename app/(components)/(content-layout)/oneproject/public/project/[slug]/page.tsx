

import { getProjectDetailsBySlug } from "../../../actions/projects";
import { getExistingUsers } from "../../../actions/users";

import ProjectDetailPage from "../../../components/projects/ProjectDetailPage";
import PublicProjectDetailPage from "../../../components/projects/PublicProjectDetailPage";
import { notFound, redirect } from "next/navigation";
import React from "react";



export default async function page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const projectData = await getProjectDetailsBySlug(slug);

  if (!projectData) {
    notFound();
  }
  return (
    <div>
      <PublicProjectDetailPage projectData={projectData} />
    </div>
  );
}
