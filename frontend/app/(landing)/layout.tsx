import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Larik AI | Enterprise Machine Learning Architecture",
  description: "Turn your raw CSV data into production-ready Web Apps in minutes.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 antialiased">
      {children}
    </div>
  );
}