import { redirect } from "next/navigation";

// Cold texting moved into the outreach room alongside the dialer. Kept as a
// redirect so bookmarks and any saved links still land in the right place.
export default function OutreachPage() {
  redirect("/cold-call?mode=text");
}
