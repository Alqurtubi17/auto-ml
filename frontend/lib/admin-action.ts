"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function approveTransaction(transactionId: string) {
    try {
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "SUCCESS" },
            include: { user: true },
        });

        const invoiceHtml = `
      <div style="font-family: sans-serif; padding: 40px; background: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; border-top: 4px solid #10b981;">
          <h1 style="color: #10b981; margin-top: 0;">Larik AI Enterprise</h1>
          <p>Halo ${transaction.user.name}, pembayaran Anda sebesar <strong>Rp ${transaction.amount.toLocaleString("id-ID")}</strong> telah kami terima.</p>
          <p>Lisensi Anda sekarang sudah <strong>AKTIF</strong>. Terima kasih telah mempercayakan sistem Anda pada Larik AI.</p>
        </div>
      </div>
    `;

        await transporter.sendMail({
            from: `"Larik AI Billing" <${process.env.EMAIL_USER}>`,
            to: transaction.user.email!,
            subject: `Invoice Pembayaran Larik AI - ${transaction.id}`,
            html: invoiceHtml,
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Gagal memproses persetujuan." };
    }
}

export async function rejectTransaction(transactionId: string, reason: string) {
    try {
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "REJECTED" },
            include: { user: true },
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Gagal memproses penolakan." };
    }
}

export async function updateUser(userId: string, data: { name: string; email: string; plan: string }) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { name: data.name, email: data.email },
        });

        if (data.plan === "ENTERPRISE") {
            const existingTx = await prisma.transaction.findFirst({
                where: { userId: userId, status: "SUCCESS" }
            });

            if (!existingTx) {
                await prisma.transaction.create({
                    data: {
                        userId: userId,
                        amount: 0,
                        planName: "Enterprise (Manual Grant)",
                        status: "SUCCESS"
                    }
                });
            }
        } else if (data.plan === "FREE") {
            await prisma.transaction.updateMany({
                where: { userId: userId, status: "SUCCESS" },
                data: { status: "REJECTED" }
            });
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Gagal mengupdate pengguna." };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Gagal menghapus pengguna. Pastikan tidak ada data yang terkait." };
    }
}

// Menyimpan banyak setting sekaligus
export async function updateSystemSettings(data: Record<string, string>) {
    try {
        const promises = Object.entries(data).map(([key, value]) =>
            prisma.setting.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            })
        );

        await Promise.all(promises);
        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}