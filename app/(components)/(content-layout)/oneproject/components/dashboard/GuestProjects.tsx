"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { GuestProject } from "@prisma/client";

// Paylaşılan süreç, bağlı ERP ilan/mülk bilgisiyle zenginleştirilmiş olabilir
type GuestProjectRow = GuestProject & {
  listing?: { title: string; listingNo: string } | null;
  property?: { title: string; address: string; city: string; district: string } | null;
};

export default function GuestProjects({
  projects,
  isOwner = false,
}: {
  projects: GuestProjectRow[];
  isOwner?: boolean;
}) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>{isOwner ? "Danışmanlar" : "Paylaşılan Süreçler"}</CardTitle>
          <CardDescription>
            {isOwner
              ? "İş birliği için davet ettiğiniz danışmanlar"
              : "İş birliği için davet edildiğiniz süreçler"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Süreç Detayları</TableHead>
              <TableHead className="text-right">Süreç Bağlantısı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const projectSlug = project.projectLink.split("/project/")[1];
              const link = `/oneproject/project/${projectSlug}`;

              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-medium">{project.projectName}</div>
                    {project.property && (
                      <div className="text-sm text-muted-foreground">
                        Mülk : {project.property.title} —{" "}
                        {project.property.district}/{project.property.city}
                      </div>
                    )}
                    {project.listing && (
                      <div className="text-sm text-muted-foreground">
                        İlan : {project.listing.title} (#
                        {project.listing.listingNo})
                      </div>
                    )}
                    {isOwner ? (
                      <div className="text-sm text-muted-foreground">
                        Danışman : {project.guestName}
                      </div>
                    ) : (
                      <div className=" text-sm text-muted-foreground ">
                        Gönderen : {project.projectOwner}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild size="sm" className="ml-auto gap-1">
                      <Link href={link}>
                        Süreci Gör
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
