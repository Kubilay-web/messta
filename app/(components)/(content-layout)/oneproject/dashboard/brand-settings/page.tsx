import { validateRequest } from "@/app/auth";
import { getAgencyById } from "@/app/(components)/(content-layout)/estate/actions/agencies";
import BrandForm from "../../components/Forms/BrandForm";

export default async function Brand() {
  const { user } = await validateRequest();
  const agency = user?.agencyId ? await getAgencyById(user.agencyId) : null;

  return (
    <div className="p-8 w-full">
      {agency ? (
        <BrandForm initialData={agency} editingId={agency.id} />
      ) : (
        <div className="min-h-[40vh] flex items-center justify-center text-center">
          <p className="text-lg font-medium">
            Bir acenteye bağlı değilsiniz. Marka ayarlarını düzenlemek için
            önce bir acente oluşturun veya bir acenteye katılın.
          </p>
        </div>
      )}
    </div>
  );
}
