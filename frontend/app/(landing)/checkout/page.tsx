import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";

export default async function CheckoutPage() {
//   const session = await auth();

//   if (!session || !session.user) {
//     redirect("/login?callbackUrl=/checkout");
//   }

  return <CheckoutClient userName={ "Pelanggan"} />;
}