"use client";

import Image from "next/image";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Project } from "@prisma/client";
import Link from "next/link";

export default function RecentProjects({
  recentProjects,
}: {
  recentProjects: Project[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Süreçler</CardTitle>
        <CardDescription>En son satış/kiralama süreçleriniz</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className=" w-[100px] sm:table-cell">
                <span className="sr-only">Görsel</span>
              </TableHead>
              <TableHead>Ad</TableHead>

              <TableHead>
                <span className="sr-only">İşlemler</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentProjects.map((project, i) => {
              return (
                <TableRow key={i}>
                  <TableCell className=" table-cell">
                    <Image
                      alt={project.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={project.thumbnail ?? "/oneproject/placeholder.svg"}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>

                  <TableCell>
                    <Button variant={"outline"} size={"sm"}>
                      <Link href={`/oneproject/project/${project.slug}`}>
                        {" "}
                        Detayları gör
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Son <strong>{recentProjects.length}</strong> süreç gösteriliyor
        </div>
      </CardFooter>
    </Card>
  );
}
