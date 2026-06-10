"use server";

import db from "@/app/lib/db";
import {
  createPropertyClient as _createPropertyClient,
  updatePropertyClient as _updatePropertyClient,
  deletePropertyClient as _deletePropertyClient,
  getPropertyClientById as _getPropertyClientById,
  getAllPropertyClients as _getAllPropertyClients,
  getAvailableUsersForClient as _getAvailableUsersForClient,
  assignUserAsClient as _assignUserAsClient,
} from "@/app/(components)/(content-layout)/estate/actions/clients";
import type {
  ClientProps,
  AssignClientProps,
} from "@/app/(components)/(content-layout)/estate/actions/clients";

export type { ClientProps, AssignClientProps };

/**
 * oneproject artık bağımsız değil; ERP'nin (estate) Gayrimenkul modellerini
 * kullanır. Müşteriler doğrudan ERP `PropertyClient` modelinden okunur ve
 * acente (agencyId) bazlı kapsamlanır.
 *
 * CRUD işlemleri ERP estate aksiyonlarından devralınır (tek kaynak).
 * "use server" dosyasında yalnızca async fonksiyon export edilebildiği için
 * ERP aksiyonları ince async sarmalayıcılarla yeniden dışa aktarılır.
 */
export async function createPropertyClient(data: ClientProps) {
  return _createPropertyClient(data);
}
export async function updatePropertyClient(
  id: string,
  data: Partial<ClientProps>
) {
  return _updatePropertyClient(id, data);
}
export async function deletePropertyClient(id: string) {
  return _deletePropertyClient(id);
}
export async function getPropertyClientById(id: string) {
  return _getPropertyClientById(id);
}
export async function getAllPropertyClients(agencyId: string) {
  return _getAllPropertyClients(agencyId);
}
export async function getAvailableUsersForClient() {
  return _getAvailableUsersForClient();
}
export async function assignUserAsClient(data: AssignClientProps) {
  return _assignUserAsClient(data);
}

/** Acentenin tüm müşterileri (alıcı/satıcı/kiracı/mülk sahibi). */
export async function getAgencyClients(agencyId: string | undefined | null) {
  if (!agencyId) return [];
  try {
    return await db.propertyClient.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { contracts: true, visits: true, interests: true } },
      },
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Son eklenen müşteriler (dashboard özeti için). */
export async function getRecentAgencyClients(
  agencyId: string | undefined | null,
  take = 3
) {
  if (!agencyId) return [];
  try {
    return await db.propertyClient.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch (error) {
    console.log(error);
    return [];
  }
}

/** Acentedeki müşteri sayısı. */
export async function getAgencyClientsCount(
  agencyId: string | undefined | null
) {
  if (!agencyId) return 0;
  try {
    return await db.propertyClient.count({ where: { agencyId } });
  } catch (error) {
    console.log(error);
    return 0;
  }
}
