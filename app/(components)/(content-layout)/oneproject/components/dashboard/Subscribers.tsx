"use client";

import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";

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
import { Subscriber } from "@prisma/client";
import { deleteSubscriber } from "../../actions/subscribe";
import { convertSubscriberToLead } from "../../actions/leads";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { timeAgo } from "../../lib/timeAgo";

export default function Subscribers({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const router = useRouter();
  const list = subscribers.map((item) => {
    const username = item.email.split("@")[0];
    return {
      username,
      email: item.email,
      id: item.id,
      createdAt: item.createdAt,
    };
  });
  async function handleDelete(id: string) {
    try {
      const res = await deleteSubscriber(id);
      if (res.ok) {
        toast.success("Abone silindi!");
      }
    } catch (error) {}
  }
  async function handleConvert(id: string) {
    const res = await convertSubscriberToLead(id);
    if (res.ok) {
      toast.success("Lead'e dönüştürüldü");
      router.push(`/oneproject/dashboard/leads/update/${res.leadId}`);
    } else {
      toast.error(res.error ?? "Dönüştürülemedi");
    }
  }
  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>E-posta Aboneleri</CardTitle>
          <CardDescription>Talep aboneleriniz.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abone</TableHead>
              <TableHead>Ne zaman</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((item, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-medium">{item.username}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {item.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {timeAgo(item.createdAt.toString())}
                    </div>
                  </TableCell>

                  <TableCell className="text-right flex items- justify-end space-x-3">
                    <Button
                      size={"sm"}
                      variant="outline"
                      onClick={() => handleConvert(item.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" /> Lead'e Çevir
                    </Button>

                    <Link href="/oneproject/dashboard/emails">
                      <Button size={"sm"}>E-posta Gönder</Button>
                    </Link>

                    <button onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
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
