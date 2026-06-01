import { Card, CardContent } from "../../../../../components/ui/card";
import ClientForm from "../../../../../components/dashboard/forms/users/client-form";

export default function NewClientPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
