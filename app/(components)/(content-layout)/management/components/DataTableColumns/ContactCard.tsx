"use client";

import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  LayoutList,
  Briefcase,
  Globe,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;      // agency / company adı
  country: string;
  schoolPage: string;  // website / linkedin
  students: number;    // listing sayısı
  role: string;
  media: string;
  message?: string;
  createdAt: string;
}

interface ContactInfoModalProps {
  contact: Contact;
  trigger?: React.ReactNode;
}

export default function ContactInfoModal({
  contact,
  trigger,
}: ContactInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const infoCards = [
    { icon: Mail,       label: "Email",    value: contact.email },
    { icon: Phone,      label: "Phone",    value: contact.phone },
    { icon: Building2,  label: "Agency",   value: contact.school },
    { icon: MapPin,     label: "Country",  value: contact.country },
    { icon: Globe,      label: "Website",  value: contact.schoolPage },
    { icon: LayoutList, label: "Listings", value: String(contact.students ?? "—") },
    { icon: Briefcase,  label: "Role",     value: contact.role },
    {
      icon: Calendar,
      label: "Submitted",
      value: new Date(contact.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" size="sm">View</Button>}
      </DialogTrigger>
      <DialogContent className="bg-white text-black sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${contact.fullName}`}
                alt={contact.fullName}
              />
              <AvatarFallback>
                {contact.fullName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-black truncate">
                {contact.fullName}
              </h2>
              <Badge variant="secondary" className="mt-1 text-black">
                Via {contact.media}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {infoCards.map((card, i) => (
            <Card key={i} className="overflow-hidden bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-3 flex flex-col items-center text-center text-black">
                <card.icon className="w-6 h-6 mb-1.5 text-blue-600" />
                <h3 className="font-semibold text-xs mb-1 text-gray-500">{card.label}</h3>
                <p className="text-xs sm:text-sm break-words w-full">
                  {card.label === "Website" ? (
                    <a
                      href={card.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      {card.value}
                    </a>
                  ) : (
                    card.value
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message */}
        {contact.message && (
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Message
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {contact.message}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
