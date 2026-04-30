import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSystemSettings } from "@/lib/settings";
import SettingsClient from "@/components/admin/AdminSetting";

export default async function SettingsPage() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/login");

  const initialSettings = await getSystemSettings();

  return <SettingsClient initialSettings={initialSettings} />;
}