import { validateRequest } from "@/app/auth";
import prisma from "@/app/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";

export default async function SecretaryClientsPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { agencyId: true },
  });

  if (!dbUser?.agencyId) {
    return <div className="p-8"><p className="text-gray-500">Ofis profili bulunamadı.</p></div>;
  }

  const clients = await prisma.propertyClient.findMany({
    where: { agencyId: dbUser.agencyId },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, phone: true,
      isBuyer: true, isSeller: true, isTenant: true, isLandlord: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <Link
          href="/management/dashboard/students/new"
          className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Yeni Müşteri
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500">Henüz müşteri yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Ad Soyad</th>
                <th className="px-4 py-3 text-left">E-posta</th>
                <th className="px-4 py-3 text-left">Telefon</th>
                <th className="px-4 py-3 text-left">Tip</th>
                <th className="px-4 py-3 text-left">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {[
                      c.isBuyer && "Alıcı",
                      c.isSeller && "Satıcı",
                      c.isTenant && "Kiracı",
                      c.isLandlord && "Mülk Sahibi",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
