import { validateRequest } from "@/app/auth";
import { getPropertyById } from "../../../../../../actions/properties";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "../../../../../../components/ui/badge";
import { Button } from "../../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import {
  ArrowLeft, MapPin, Building2, Ruler, Home,
  FileText, CalendarCheck, Tag, User, Phone, Hash,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Mülk Detayı - EstatePro" };

const typeLabel: Record<string, string> = {
  APARTMENT: "Daire", HOUSE: "Ev", VILLA: "Villa", OFFICE: "Ofis",
  SHOP: "Dükkan", LAND: "Arsa", WAREHOUSE: "Depo", BUILDING: "Bina",
};
const statusLabel: Record<string, string> = {
  AVAILABLE: "Müsait", SOLD: "Satıldı", RENTED: "Kiralandı",
  UNDER_CONTRACT: "Sözleşmede", UNDER_MAINTENANCE: "Bakımda",
};
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AVAILABLE: "default", SOLD: "secondary", RENTED: "secondary",
  UNDER_CONTRACT: "outline", UNDER_MAINTENANCE: "destructive",
};

export default async function PropertyViewPage({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user) redirect("/estate/login");

  const property = await getPropertyById(params.id);
  if (!property) notFound();

  const count = (property as any)._count ?? {};

  const features = [
    { label: "Asansör",    active: property.hasElevator },
    { label: "Otopark",    active: property.hasParking  },
    { label: "Eşyalı",    active: property.isFurnished  },
    { label: "Bahçe",     active: property.hasGarden    },
    { label: "Havuz",     active: property.hasPool      },
    { label: "Balkon",    active: property.hasBalcony   },
    { label: "Öne Çıkan", active: property.isFeatured   },
  ].filter((f) => f.active);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Üst Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/estate/dashboard/academics/properties">
            <ArrowLeft className="mr-1 h-4 w-4" /> Geri
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/estate/dashboard/academics/properties/edit/${property.id}`}>Düzenle</Link>
        </Button>
      </div>

      {/* Başlık Kartı */}
      <Card className="border-t-4 border-blue-600">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-black">{property.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-black">
                  {typeLabel[property.propertyType] ?? property.propertyType}
                </Badge>
                <Badge variant={statusVariant[property.status] ?? "secondary"}>
                  {statusLabel[property.status] ?? property.status}
                </Badge>
                {property.roomCount && <Badge variant="secondary" className="text-black">{property.roomCount}</Badge>}
                {features.map((f) => (
                  <Badge key={f.label} variant="secondary" className="text-xs text-black">{f.label}</Badge>
                ))}
              </div>
            </div>
            {property.price && (
              <div className="text-right">
                <p className="text-3xl font-extrabold text-blue-600">
                  {property.price.toLocaleString("tr-TR")} {property.currency}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bilgi Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { icon: MapPin,    label: "Şehir / İlçe",   value: `${property.city}, ${property.district}` },
          { icon: Building2, label: "Mülk Tipi",       value: typeLabel[property.propertyType] ?? property.propertyType },
          { icon: Ruler,     label: "Brüt Alan",        value: property.grossArea ? `${property.grossArea} m²` : "—" },
          { icon: Ruler,     label: "Net Alan",          value: property.netArea   ? `${property.netArea} m²`   : "—" },
          { icon: Home,      label: "Kat / Toplam",     value: property.floorNo != null ? `${property.floorNo} / ${property.totalFloors ?? "?"}` : "—" },
          { icon: Tag,       label: "Bina Yaşı",        value: property.buildingAge != null ? `${property.buildingAge} yıl` : "—" },
          { icon: Tag,       label: "Isıtma",           value: property.heatingType ?? "—" },
          { icon: User,      label: "Mülk Sahibi",      value: property.ownerName ?? "—" },
          { icon: Phone,     label: "Sahip Telefonu",   value: property.ownerPhone ?? "—" },
          { icon: Hash,      label: "Banyo",            value: property.bathroomCount != null ? String(property.bathroomCount) : "—" },
          { icon: FileText,  label: "Sözleşme",         value: String(count.contracts ?? 0) },
          { icon: CalendarCheck, label: "Gezi",         value: String(count.visits    ?? 0) },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border border-gray-200">
            <CardContent className="p-3 flex flex-col items-center text-center">
              <Icon className="w-5 h-5 mb-1.5 text-blue-600" />
              <p className="text-[10px] font-semibold text-black uppercase tracking-wide mb-1">{label}</p>
              <p className="text-xs text-black break-words w-full">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Açıklama */}
      {(property.description || property.notes) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {property.description && (
            <Card>
              <CardHeader><CardTitle className="text-sm text-black">Açıklama</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-black whitespace-pre-wrap">{property.description}</p></CardContent>
            </Card>
          )}
          {property.notes && (
            <Card>
              <CardHeader><CardTitle className="text-sm text-black">Dahili Notlar</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-black whitespace-pre-wrap">{property.notes}</p></CardContent>
            </Card>
          )}
        </div>
      )}

      {/* İlanlar */}
      {(property as any).listings?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-black">Bağlı İlanlar</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(property as any).listings.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 last:border-none">
                  <div className="min-w-0">
                    <p className="text-sm text-black font-medium truncate">{l.title}</p>
                    <p className="text-xs text-black">{l.listingNo}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs text-black">{l.listingType}</Badge>
                    <Badge variant="secondary" className="text-xs">{l.status}</Badge>
                    {l.askingPrice && (
                      <span className="text-xs font-semibold text-black">
                        {l.askingPrice.toLocaleString("tr-TR")}
                      </span>
                    )}
                    <Button asChild size="icon" variant="outline" className="h-6 w-6">
                      <Link href={`/estate/dashboard/academics/listings/view/${l.id}`}>
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "İlan",       value: count.listings  ?? 0, icon: Tag },
          { label: "Sözleşme",   value: count.contracts ?? 0, icon: FileText },
          { label: "Mülk Gezisi", value: count.visits   ?? 0, icon: CalendarCheck },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="text-center">
            <CardContent className="p-4">
              <Icon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-extrabold text-black">{value}</p>
              <p className="text-xs text-black mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
