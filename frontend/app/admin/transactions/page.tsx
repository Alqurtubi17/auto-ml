import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminTransactionsClient from "@/components/admin/AdminTransactionsClient";

export default async function TransactionsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      user: {
        role: { not: "ADMIN" },
        email: { not: { contains: "test" } }
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return <AdminTransactionsClient transactions={transactions} />;
}