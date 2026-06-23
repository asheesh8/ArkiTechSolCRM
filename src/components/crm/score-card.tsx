import { Card, CardContent } from "@/components/ui/card";
import { cn, scoreTone } from "@/lib/utils";

const tones = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-red-600",
  muted: "text-zinc-500",
};

export function ScoreCard({ label, value }: { label: string; value?: number | null }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className={cn("mt-2 text-3xl font-semibold", tones[scoreTone(value)])}>{value ?? "--"}</p>
      </CardContent>
    </Card>
  );
}
