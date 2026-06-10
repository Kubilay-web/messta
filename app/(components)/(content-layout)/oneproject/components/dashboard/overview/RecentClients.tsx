import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { PropertyClient } from "@prisma/client";
import { getInitials } from "../../../lib/generateInitials";

function clientTypeLabel(c: PropertyClient) {
  const tags: string[] = [];
  if (c.isBuyer) tags.push("Alıcı");
  if (c.isSeller) tags.push("Satıcı");
  if (c.isTenant) tags.push("Kiracı");
  if (c.isLandlord) tags.push("Kiraya Veren");
  return tags[0] ?? "";
}

export default function RecentClients({
  recentClients,
}: {
  recentClients: PropertyClient[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Müşteriler</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        {recentClients.map((client, i) => {
          const fullName = `${client.firstName} ${client.lastName}`;
          return (
            <div key={i} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage
                  src={client.imageUrl ?? "/oneproject/avatars/01.png"}
                  alt={fullName}
                />
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
              <div className="ml-auto font-medium">
                {clientTypeLabel(client)}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
