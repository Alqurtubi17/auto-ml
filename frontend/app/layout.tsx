import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const deploymentUrl = process.env.NODE_ENV === "production" ? "https://larikai.com" : "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Larik AI | Enterprise ML Architecture",
    template: "%s | Larik AI"
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  description: "Turn raw CSV data into production-ready Web Apps in minutes.",
  applicationName: "Larik AI",
  authors: [{ name: "Larik AI Team" }],
  generator: "Next.js",
  keywords: ["Machine Learning", "Data Science", "Web Apps", "AI", "Enterprise", "AutoML", 
    "Data Analyst", "Data Analytics", "Auto Machine Learning", "AI-Powered Web Builder"],

  openGraph: {
    title: "Larik AI | Enterprise ML Architecture",
    description: "Predict the future. Ship today. Turn raw CSV data into production-ready Web Apps in minutes.",
    url: deploymentUrl,
    siteName: "Larik AI",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Larik AI Preview Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Larik AI",
    description: "Enterprise Machine Learning Architecture",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}