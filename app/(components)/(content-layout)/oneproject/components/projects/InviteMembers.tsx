"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { ExistingUser } from "../../actions/users";
import { InvitationDetailsProps, sendMemberInvitation } from "../../actions/emails";
import { ProjectData } from "../../types/types";
import toast from "react-hot-toast";

export default function InviteMembers({
  allMembers,
  projectData,
}: {
  allMembers: ExistingUser[];
  projectData: ProjectData;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<ExistingUser[]>([]);
  const [sending, setSending] = useState(false);

  const filteredMembers = allMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMember = (memberId: string) => {
    const member = allMembers.find((user) => user.id === memberId);
    if (!member) return;
    if (!selectedMembers.some((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchQuery("");
  };

  const handleRemoveSelected = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== memberId));
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const projectDetails: InvitationDetailsProps = {
    loginLink: `${baseUrl}/?returnUrl=/project/${projectData.slug}`,
    projectName: projectData.name,
    projectOwner: projectData.user.name,
    projectOwnerId: projectData.userId,
  };

  const handleInvite = async () => {
    setSending(true);
    try {
      await sendMemberInvitation(selectedMembers, projectDetails);
      setIsOpen(false);
      setSelectedMembers([]);
      setSearchQuery("");
      toast.success("Davet başarıyla gönderildi");
    } catch (error) {
      console.error(error);
      toast.error("Davetler gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Davet Et
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white text-black">
        <SheetHeader>
          <SheetTitle>Danışman Davet Et</SheetTitle>
          <SheetDescription>
            Projenize davet etmek için danışman arayın ve seçin.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <Input
            placeholder="Danışman ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 text-black"
          />

          {selectedMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Seçili Danışmanlar:</h3>
              <ScrollArea className="h-[100px]">
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((user) => {
                    const member = allMembers.find((m) => m.id === user.id);
                    return (
                      <Badge
                        key={user.id}
                        variant="secondary"
                        className="py-1 flex items-center gap-1"
                      >
                        {member?.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 hover:bg-transparent"
                          onClick={() => handleRemoveSelected(user.id)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">{member?.name} kaldır</span>
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {searchQuery && (
            <ScrollArea className="h-[300px] rounded-md border border-gray-200 p-4 bg-white text-black">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.some((user) => user.id === member.id)}
                      onCheckedChange={() => handleSelectMember(member.id)}
                    />
                    <label
                      htmlFor={`member-${member.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      <div>{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Danışman bulunamadı</p>
              )}
            </ScrollArea>
          )}

          {!searchQuery && (
            <p className="text-center text-gray-500">Aramak için yazın</p>
          )}
        </div>

        <SheetFooter>
          {sending ? (
            <Button disabled className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Davet gönderiliyor, lütfen bekleyin
            </Button>
          ) : (
            <Button
              onClick={handleInvite}
              disabled={selectedMembers.length === 0}
            >
              Seçili Danışmanları Davet Et ({selectedMembers.length})
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
