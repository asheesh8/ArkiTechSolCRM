import { redirect } from "next/navigation";

// Clients now log in at the unified /login page
export default function PortalLoginRedirect() {
  redirect("/login");
}
