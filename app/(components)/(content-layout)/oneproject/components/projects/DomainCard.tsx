import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Edit2, X } from "lucide-react";
import { ProjectData } from "../../types/types";
import FreeDomainForm from "../Forms/FreeDomainForm";
import CustomDomainForm from "../Forms/CustomDomainForm";
import Link from "next/link";

interface DomainCardProps {
  projectName: string;
  vercelDomain: string;
  customDomain: string;
  onEditVercelDomain: () => void;
  onEditCustomDomain: () => void;
}

export default function DomainCard({
  projectData,
  isPrivate = true,
}: {
  projectData: ProjectData;
  isPrivate?: boolean;
}) {
  const [isEditingFree, setIsEditingFree] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Alan Adları</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {isEditingFree && isPrivate ? (
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h2>Ücretsiz Alan Adı</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit Free domain ${projectData.freeDomain}`}
                    onClick={() => setIsEditingFree(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <FreeDomainForm
                  editingId={projectData.id}
                  initialDomain={projectData.freeDomain}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Ücretsiz Alan Adı
                </p>
                <Link
                  target="_blank"
                  href={projectData.freeDomain ?? "#"}
                  className="text-lg font-semibold"
                >
                  {projectData.freeDomain}
                </Link>
              </div>
            )}
            {!isEditingFree && isPrivate && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit Free domain ${projectData.freeDomain}`}
                onClick={() => setIsEditingFree(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            {isEditingCustom && isPrivate ? (
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h2>Özel Alan Adı</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit Free domain ${projectData.freeDomain}`}
                    onClick={() => setIsEditingCustom(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CustomDomainForm
                  editingId={projectData.id}
                  initialDomain={projectData.customDomain}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Özel Alan Adı
                </p>
                <Link
                  target="_blank"
                  href={projectData.freeDomain ?? "#"}
                  className="text-lg font-semibold"
                >
                  {projectData.customDomain}
                </Link>
              </div>
            )}
            {!isEditingCustom && isPrivate && (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit Custom domain ${projectData.customDomain}`}
                onClick={() => setIsEditingCustom(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
