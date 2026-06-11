import PageTitle from "../../../components/page-title";
import db from "@/app/lib/db";
import React from "react";
import UsersTable from "./_components/users-table";

async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      username: true,
      avatarUrl:true,
      email: true,
      roleestate: true, 
      createdAt: true,
      updatedAt: true,
    },
  });
  
  return (
    <div>
      <PageTitle title="Admin / Users" />
      <UsersTable users={users} />
    </div>
  );
}

export default AdminUsersPage;