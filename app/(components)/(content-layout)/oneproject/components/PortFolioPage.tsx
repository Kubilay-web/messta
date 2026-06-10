import React from "react";
import {
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  MapPin,
  Monitor,
  Mail,
  Calendar,
  Github,
} from "lucide-react";
import Image from "next/image";
import { PortfolioProfile, Project } from "@prisma/client";
import PortfolioCard from "./projects/PortfolioCard";
import { ProjectWithUser } from "../types/types";
import { Button } from "./ui/button";
import Link from "next/link";
import SubscribeForm from "./Forms/SubscribeForm";
import { OtherPortfolioProjects } from "./OtherPortfolioProjects";
type ProjectCardProps = {
  title: string;
  description: string;
  revenue: string;
  data: string;
};
export default function Portfolio({
  projects,
  profile,
  otherProjects,
}: {
  projects: ProjectWithUser[];
  otherProjects: ProjectWithUser[];
  profile: PortfolioProfile;
}) {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="bg-yellow-300 rounded-full w-48 h-48 mx-auto mb-6 overflow-hidden">
              <Image
                src={profile.profileImage ?? "/oneproject/placeholder.svg"}
                alt={profile.name}
                width={640}
                height={512}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">
              {profile.name}
            </h1>
            <div className="flex items-center justify-center mb-4">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-500">{profile.location}</span>
              <Monitor className="w-4 h-4 ml-4 mr-2 text-gray-500" />
              <span className="text-gray-500">
                {profile.projectCount} İlan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href={profile.bookingLink}>
                  <Calendar className="mr-2 w-4 h-4" />
                  Randevu Al
                </Link>
              </Button>
              <Button asChild variant={"outline"}>
                <Link
                  href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${profile.email}&su=Your+Subject+Here&body=Your+Body+Text+Here"`}
                >
                  <Mail className="mr-2 w-4 h-4" />
                  E-posta Gönder
                </Link>
              </Button>
            </div>
            <p className="text-center py-3">
              {profile.description}
              👇
            </p>
            {/* Subscribe */}
            {/* <div className="flex mb-6">
              <input
                type="email"
                placeholder="Your email..."
                className="flex-grow rounded-l-lg border-t border-b border-l border-gray-300 px-4 py-2"
              />
              <button className="bg-yellow-500 text-white rounded-r-lg px-6 py-2 font-semibold">
                Subscribe
              </button>
            </div> */}
            <SubscribeForm userId={profile.userId} />
            <div className="flex justify-center space-x-4">
              <Link href={profile.twitterUrl ?? ""}>
                <Twitter className="w-6 h-6 text-gray-500" />
              </Link>
              <Link href={profile.youtubeUrl ?? ""}>
                <Youtube className="w-6 h-6 text-gray-500" />
              </Link>
              <Link href={profile.linkedinUrl ?? ""}>
                <Linkedin className="w-6 h-6 text-gray-500" />
              </Link>
              <Link href={profile.instagramUrl ?? ""}>
                <Instagram className="w-6 h-6 text-gray-500" />
              </Link>
              <Link href={profile.githubUrl ?? ""}>
                <Github className="w-6 h-6 text-gray-500" />
              </Link>
            </div>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects && projects.length > 0 ? (
              projects.map((project, index) => (
                <PortfolioCard key={project.id ?? index} project={project} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-10">
                İlan bulunamadı
              </div>
            )}
            {/* {projects.map((project, index) => (
              // <ProjectCard key={index} project={project} />
              <PortfolioCard key={index} project={project} />
            ))} */}
          </div>
        </div>
      </div>

      {otherProjects.length > 0 ? (
        <div className="py-16">
          <OtherPortfolioProjects otherProjects={otherProjects} />
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500">
          Başka ilan yok
        </div>
      )}

      {/* {otherProjects.length > 0 && (
        <div className="py-16">
          <OtherPortfolioProjects otherProjects={otherProjects} />
        </div>
      )} */}
    </div>
  );
}
