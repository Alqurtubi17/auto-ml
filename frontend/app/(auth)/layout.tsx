import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Larik AI",
  description: "Secure Enterprise Machine Learning Access",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-zinc-50 antialiased">
      {children}
    </main>
  );
}