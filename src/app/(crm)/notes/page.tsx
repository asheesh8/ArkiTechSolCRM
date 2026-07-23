import { redirect } from "next/navigation";
import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Notes · LocalLead CRM" };

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="-mt-1">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
        <p className="mt-1 text-sm text-zinc-500">Filing cabinets and pages for everything the team keeps track of.</p>
      </div>
      <NotesWorkspace user={{ id: user.id, name: user.name }} />
    </div>
  );
}
