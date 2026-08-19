"use client";

import { PeekButton } from "@/components/mascot/peek-button";

/** Scratch page for looking at Arki in isolation. Not linked from the site. */
export default function MascotLab() {
  return (
    <main className="min-h-screen px-8 py-24" style={{ background: "#0c0c18", color: "white" }}>
      <div className="mx-auto flex max-w-3xl flex-col gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Mascot lab</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Arki</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
            Hover or tab to any button. Head rises from behind the rim, hands hook over the front.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-14">
          <PeekButton className="bg-white text-[#0c0c18]">Start a project</PeekButton>
          <PeekButton side="left" className="border border-white/20 bg-white/10 text-white">Call us</PeekButton>
          <PeekButton side="right" className="bg-gradient-to-r from-violet-500 to-sky-400 text-white">See pricing</PeekButton>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm text-white/40">Against a panel, to check the layering reads at a different contrast.</p>
          <div className="mt-10">
            <PeekButton className="bg-violet-500 text-white">Get a quote</PeekButton>
          </div>
        </div>
      </div>
    </main>
  );
}
