import { Card, CardContent } from "../../../../../components/ui/card";
import PropertyForm from "../../../../../components/dashboard/forms/properties/property-form";

export default function NewPropertyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card className="border-t-4 border-blue-600 shadow">
        <CardContent className="p-6">
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  );
}
