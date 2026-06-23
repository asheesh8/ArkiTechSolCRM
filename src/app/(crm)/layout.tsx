import { AppShell } from "@/components/crm/app-shell";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
