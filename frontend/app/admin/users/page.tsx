import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "@/components/admin/AdminUsersClient";

export default async function UsersPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    include: {
      transactions: {
        where: { status: "SUCCESS" },
      }
    },
    orderBy: { emailVerified: "desc" },
  });

  return <AdminUsersClient users={users} />;
}