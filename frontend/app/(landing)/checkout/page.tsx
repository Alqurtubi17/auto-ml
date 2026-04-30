import { auth } from "@/auth";
import { getSystemSettings } from "@/lib/settings";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/landing/CheckoutClient";

export default async function CheckoutPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const settings = await getSystemSettings();

  return <CheckoutClient userName={session.user.name || "Pelanggan"} settings={settings}/>;
}