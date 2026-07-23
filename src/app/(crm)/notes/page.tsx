import { NotesWorkspace } from "@/components/notes/notes-workspace";

export const metadata = { title: "Notes · LocalLead CRM" };

export default function NotesPage() {
  return (
    <div className="-mt-1">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Notes</h2>
        <p className="mt-1 text-sm text-zinc-500">Filing cabinets and pages for everything the team keeps track of.</p>
      </div>
      <NotesWorkspace />
    </div>
  );
}
