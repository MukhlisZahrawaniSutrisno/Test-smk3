import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import ArsipPageClient from "./ArsipClient";

export default async function ArsipPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") {
    redirect("/admin/audit");
  }

  return <ArsipPageClient />;
}
