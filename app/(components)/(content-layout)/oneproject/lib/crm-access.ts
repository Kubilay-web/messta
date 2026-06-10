import { validateRequest } from "@/app/auth";

/**
 * UserRoleGayrimenkul tabanlı CRM erişim kontrolü.
 * - Yönetebilenler (oluştur/düzenle/sil): SUPER_ADMIN, ADMIN, AGENT, SECRETARY
 * - Görüntüleyebilenler: yöneticiler + ACCOUNTANT (raporlama)
 * - CLIENT / USER: CRM'e erişemez
 */
export type GayrimenkulRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "AGENT"
  | "CLIENT"
  | "SECRETARY"
  | "ACCOUNTANT"
  | "USER";

export const CRM_MANAGE_ROLES: GayrimenkulRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "AGENT",
  "SECRETARY",
];

export const CRM_VIEW_ROLES: GayrimenkulRole[] = [
  ...CRM_MANAGE_ROLES,
  "ACCOUNTANT",
];

export async function getCrmAccess() {
  const { user } = await validateRequest();
  const role = (user?.roleGayrimenkul ?? "USER") as GayrimenkulRole;
  return {
    user,
    role,
    agencyId: user?.agencyId ?? "",
    canView: CRM_VIEW_ROLES.includes(role),
    canManage: CRM_MANAGE_ROLES.includes(role),
  };
}
