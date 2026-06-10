import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectDetailsBySlug } from "../../../../actions/projects";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

const listingTypeLabels: Record<string, string> = {
  SALE: "Satılık",
  RENT: "Kiralık",
  SHORT_RENT: "Kısa Dönem Kiralık",
};

const propertyTypeLabels: Record<string, string> = {
  APARTMENT: "Daire",
  HOUSE: "Müstakil Ev",
  VILLA: "Villa",
  OFFICE: "Ofis",
  SHOP: "Dükkan",
  LAND: "Arsa",
  WAREHOUSE: "Depo",
  BUILDING: "Bina",
};

const statusLabels: Record<string, string> = {
  ONGOING: "Devam Ediyor",
  COMPLETE: "Tamamlandı",
};

const fmtPrice = (v?: number | null, currency = "TRY") =>
  v != null ? `${Number(v).toLocaleString("tr-TR")} ${currency}` : "-";

const fmtDate = (d?: Date | string | null) =>
  d ? new Date(d).toLocaleDateString("tr-TR") : "-";

export default async function page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const project = await getProjectDetailsBySlug(slug);
  if (!project) return notFound();

  const p: any = project;
  const listing = p.listing;
  const property = p.property;
  const client = p.client;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative overflow-hidden rounded-md shrink-0 bg-gray-100">
            <Image
              src={p.thumbnail ?? "/oneproject/thumbnail.png"}
              alt={p.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {p.name}
            </h1>
            <span className="inline-block mt-1 rounded bg-blue-50 text-blue-700 text-xs px-2 py-0.5">
              {statusLabels[p.status] ?? p.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/oneproject/dashboard/projects/update/${p.id}`}>
              Düzenle
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/oneproject/project/${p.slug}`}>Çalışma Alanı</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* İLAN */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">İlan (ERP)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {listing ? (
              <>
                <p className="font-medium">{listing.title}</p>
                <p className="text-muted-foreground">
                  İlan No: {listing.listingNo}
                </p>
                <p>
                  Tip: {listingTypeLabels[listing.listingType] ?? listing.listingType}
                </p>
                <p className="font-semibold text-emerald-700">
                  {fmtPrice(listing.askingPrice, listing.currency)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">İlan bağlı değil</p>
            )}
          </CardContent>
        </Card>

        {/* MÜLK */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mülk (ERP)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {property ? (
              <>
                <p className="font-medium">{property.title}</p>
                <p className="text-muted-foreground">
                  {[property.district, property.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{property.address}</p>
                <p>
                  Tip:{" "}
                  {propertyTypeLabels[property.propertyType] ??
                    property.propertyType}
                </p>
                {property.roomCount && <p>Oda: {property.roomCount}</p>}
                {property.grossArea && <p>Brüt: {property.grossArea} m²</p>}
              </>
            ) : (
              <p className="text-muted-foreground">Mülk bağlı değil</p>
            )}
          </CardContent>
        </Card>

        {/* MÜŞTERİ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Müşteri (ERP)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {client ? (
              <>
                <p className="font-medium">
                  {client.firstName} {client.lastName}
                </p>
                {client.phone && (
                  <p className="text-muted-foreground">{client.phone}</p>
                )}
                {client.email && (
                  <p className="text-muted-foreground">{client.email}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Müşteri bağlı değil</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SÜREÇ BİLGİLERİ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Süreç Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Anlaşma / Hedef Fiyat</p>
            <p className="font-medium">{fmtPrice(p.budgetLocal || p.budget)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Başlangıç</p>
            <p className="font-medium">{fmtDate(p.startDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Hedef Kapanış</p>
            <p className="font-medium">{fmtDate(p.endDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tahsilat Sayısı</p>
            <p className="font-medium">{p.payments?.length ?? 0}</p>
          </div>
          {p.description && (
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-muted-foreground">Açıklama</p>
              <p>{p.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
