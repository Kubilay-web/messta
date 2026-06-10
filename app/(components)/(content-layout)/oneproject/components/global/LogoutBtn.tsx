"use client";
// import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function LogoutBtn() {
  const router = useRouter();
  async function handleLogout() {
    try {
      // await signOut();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }
  return <button onClick={handleLogout}>Logout</button>;
}
