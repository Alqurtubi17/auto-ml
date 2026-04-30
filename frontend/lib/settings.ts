// lib/settings.ts
"use server";

import { prisma } from "@/lib/prisma";

// Fungsi publik: Hanya membaca, aman dipanggil dari Landing Page
export async function getSystemSettings() {
    const settings = await prisma.setting.findMany();
    return settings.reduce((acc: any, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});
}