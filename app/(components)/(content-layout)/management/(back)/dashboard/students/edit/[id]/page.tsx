import { Card, CardContent } from "../../../../../components/ui/card";
import SingleStudentForm from "../../../../../components/dashboard/forms/students/student-form";
import { validateRequest } from "@/app/auth";
import { SchoolUser } from "@/app/(components)/(content-layout)/management/actions/auth";
import { getAllClasses } from "../../../../../actions/classes";
import { getAllParents } from "../../../../../actions/parents";
import { getStudentNextSequence, getStudentById } from "../../../../../actions/students";
import { notFound } from "next/navigation";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();
  if (!user) return null;

  const { id } = await params;

  const [school, student] = await Promise.all([
    SchoolUser(user.id),
    getStudentById(id),
  ]);

  if (!student) notFound();

  const [classes, parents, nextSequence] = await Promise.all([
    getAllClasses(school?.id ?? ""),
    getAllParents(school?.id ?? ""),
    getStudentNextSequence(school?.id ?? ""),
  ]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <SingleStudentForm
            editingId={id}
            initialData={student}
            classes={classes || []}
            parents={parents || []}
            nextSeq={nextSequence || 0}
            schoolId={school?.id ?? ""}
            schoolName={school?.name ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
