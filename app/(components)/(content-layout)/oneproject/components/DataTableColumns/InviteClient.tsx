import React, { useState } from "react";
import { Button } from "../ui/button";
import { User } from "@prisma/client";
import { sendClientInvitation } from "../../actions/emails";
import { InvitationProps } from "../email-templates/ClientInvitation";
import toast from "react-hot-toast";
import { ProjectData } from "../../types/types";

export default function InviteClient({ row }: { row: any }) {
  const projectData: ProjectData = row;
  const [loading, setLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  async function inviteClient() {
    const data: InvitationProps = {
      clientName: projectData.client.name,
      projectName: projectData.name,
      message:
        "We're excited to have you on board! Please use the login details below to access the project workspace.",
      loginEmail: projectData.client.email,
      loginPassword: projectData.client?.plain ?? "",
      loginLink: `${baseUrl}/?returnUrl=/project/${projectData.slug}`,
    };
    setLoading(true);
    try {
      const res = await sendClientInvitation(data);
      setLoading(false);
      toast.success("Invite Sent");
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <Button
      disabled={loading}
      variant={"outline"}
      onClick={inviteClient}
      className=""
    >
      {loading ? "Sending..." : "Send Invite"}
    </Button>
  );
}
