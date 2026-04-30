import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const filterKotor = {
    role: { not: "ADMIN" },
    email: { not: { contains: "test" } }
  } as const;

  // Hanya 2 kali tarik data yang sudah disaring bersih
  const [transactions, totalUsers] = await Promise.all([
    prisma.transaction.findMany({
      where: { user: filterKotor },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.count({
      where: filterKotor
    }),
  ]);

  // Olah data di memori
  let totalRevenue = 0;
  let pendingTransactions = 0;
  let successTransactions = 0;

  for (const tx of transactions) {
    if (tx.status === "SUCCESS") {
      totalRevenue += tx.amount;
      successTransactions++;
    } else if (tx.status === "PENDING") {
      pendingTransactions++;
    }
  }

  const stats = {
    totalUsers,
    totalRevenue,
    pendingTransactions,
    successTransactions,
  };

  return <AdminClient transactions={transactions} stats={stats} />;
}