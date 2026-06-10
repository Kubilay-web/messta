

import { validateRequest } from "@/app/auth";
import { getProjectDetailsBySlug } from "../../actions/projects";
import { getExistingUsers } from "../../actions/users";
import ProjectDetailPage from "../../components/projects/ProjectDetailPage";
import { notFound, redirect } from "next/navigation";
import React from "react";

export default async function page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const existingUsers = (await getExistingUsers()) || [];
  const projectData = await getProjectDetailsBySlug(slug);

  if (!projectData) {
    notFound();
  }
  const {user} = await validateRequest();
  // const baseUrl =
  const returnUrl = `/oneproject/project/${slug}`;
  if (!user) {
    // redirect(`/login?returnUrl=${returnUrl}`);

    redirect(`/`);
  }


   const safeUser = {
    id: user?.id,
    roleproject: user?.roleproject,
    email: user?.email,
    username: user?.username,
    avatarUrl:user?.avatarUrl
  };
  return (
    <div>
      <ProjectDetailPage
        existingUsers={existingUsers}
        user={safeUser}
        projectData={projectData}
      />
    </div>
  );
}
