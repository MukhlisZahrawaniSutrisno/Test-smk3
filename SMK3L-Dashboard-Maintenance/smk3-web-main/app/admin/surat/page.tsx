import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import SuratPageClient from "./SuratClient";

export default async function SuratPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") {
    redirect("/admin/audit");
  }

  return <SuratPageClient />;
}
