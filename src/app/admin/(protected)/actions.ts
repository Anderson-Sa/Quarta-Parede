"use server";

import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/adminSession";

export async function logout() {
  await destroyAdminSession();
  redirect("/admin/login");
}
