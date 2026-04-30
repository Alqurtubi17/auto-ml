import DashboardClient from "./DashboardClient";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardsPage() {
  const session = await auth();

  // Ambil data user yang paling fresh dari database
  let freshUser: any = session?.user;
  
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        name: true, 
        role: true,
        transactions: {
          where: { status: "SUCCESS" },
          take: 1
        }
      }
    });
    
    if (dbUser) {
      const plan = dbUser.transactions.length > 0 ? "ENTERPRISE" : "FREE";
      freshUser = { ...session.user, ...dbUser, plan: plan || "FREE" };
    }
  }

  // Oper data user ke Client Component
  return <DashboardClient user={freshUser} />;
}