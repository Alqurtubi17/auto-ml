import { auth } from "@/auth"; 
import { redirect } from "next/navigation";
import { getSystemSettings } from "@/lib/settings"; 
import { prisma } from "@/lib/prisma";
import AuthClient from "@/components/AuthClient";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (dbUser?.role === "ADMIN") {
      redirect("/admin"); 
    } else {
      redirect("/dashboards"); 
    }
  }

  const settings = await getSystemSettings();
  const appName = settings?.APP_NAME || "Larik AI";

  return <AuthClient appName={appName} />;
}