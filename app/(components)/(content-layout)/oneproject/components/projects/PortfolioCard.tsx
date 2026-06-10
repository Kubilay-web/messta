"use client";
import Image from "next/image";
import { FollowerPointerCard } from "../ui/following-pointer";
import { ProjectWithUser } from "../../types/types";
import { getNormalDate } from "../../lib/getNormalDate";
import Link from "next/link";

export default function PortfolioCard({
  project,
}: {
  project: ProjectWithUser;
}) {
  return (
    <div className="w-80 mx-auto">
      <FollowerPointerCard
        title={
          <TitleComponent
            title={project.user.name}
            avatar={project.user.image ?? "/placeholder.svg"}
          />
        }
      >
        <div className="relative overflow-hidden h-full rounded-2xl transition duration-200 group bg-white hover:shadow-xl border border-zinc-100">
          <div className="w-full aspect-w-16 aspect-h-10 bg-gray-100 rounded-tr-lg rounded-tl-lg overflow-hidden xl:aspect-w-16 xl:aspect-h-10 relative">
            <Image
              src={project.thumbnail ?? "/placeholder.svg"}
              alt={project.name}
              width={800}
              height={800}
              objectFit="cover"
              className={`group-hover:scale-95 group-hover:rounded-2xl transform object-cover transition duration-200 h-[200px] `}
            />
          </div>
          <div className=" p-4">
            <h2 className="font-bold my-2 text-lg text-zinc-700">
              {project.name}
            </h2>
            {/* ERP ilan/mülk bilgisi (varsa) */}
            {(project.property || project.listing) && (
              <div className="flex flex-wrap items-center gap-2 my-1">
                {project.property && (
                  <span className="text-xs text-gray-500">
                    {project.property.district}/{project.property.city}
                  </span>
                )}
                {project.listing && (
                  <span className="text-xs font-semibold text-emerald-700">
                    {project.listing.askingPrice.toLocaleString("tr-TR")}{" "}
                    {project.listing.currency}
                  </span>
                )}
              </div>
            )}
            <h2 className="font-normal line-clamp-2 my-2 text-sm text-zinc-500">
              {project.description}
            </h2>
            <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {getNormalDate(project.startDate)}
              </span>
              <Link
                href={`/oneproject/public/project/${project.slug}`}
                className="relative z-10 px-6 py-2 bg-black text-white font-bold rounded-xl block text-xs"
              >
                Detayları Gör
              </Link>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
}

const TitleComponent = ({
  title,
  avatar,
}: {
  title: string;
  avatar: string;
}) => (
  <div className="flex space-x-2 items-center">
    <Image
      src={avatar}
      height="20"
      width="20"
      alt="thumbnail"
      className="rounded-full border-2 border-white"
    />
    <p>{title}</p>
  </div>
);
