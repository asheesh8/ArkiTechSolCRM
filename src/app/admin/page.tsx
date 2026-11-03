import { redirect } from "next/navigation";
import { getStaff } from "@/lib/tenant/context";

export default async function AdminHome() {
  const staff = await getStaff();
  if (!staff) redirect("/");
  return <main className="p-8">ArkiTech console</main>;
}
