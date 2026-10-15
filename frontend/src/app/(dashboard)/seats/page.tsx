import { redirect } from "next/navigation";

// Seat management now lives on the per-profile subscription page.
export default function SeatsPage() {
  redirect("/subscription");
}
