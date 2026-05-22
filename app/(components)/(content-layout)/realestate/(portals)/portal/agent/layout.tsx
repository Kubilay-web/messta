import RoleBasedWrapper from "../../../components/RoleBasedWrapper";
import { ReactNode } from "react";

export default function AgentPortalLayout({ children }: { children: ReactNode }) {
  return (
    <RoleBasedWrapper allowedRoles={["AGENT"]}>{children}</RoleBasedWrapper>
  );
}
