import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MainLayoutClient from "@/components/MainLayoutClient";

export default async function MainGroup_Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

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

  if (!dbUser) {
    redirect("/login");
  }

  const userPlan = dbUser.transactions.length > 0 ? "ENTERPRISE" : "FREE";

  if (dbUser.role === "ADMIN") {
    redirect("/admin");
  }

  if (userPlan === "FREE") {
    redirect("/checkout");
  }

  const freshUserData = {
    ...session.user,
    name: dbUser.name,
    plan: userPlan,
    role: dbUser.role
  };

  return (
    <MainLayoutClient user={freshUserData}>
      {children}
    </MainLayoutClient>
  );
}