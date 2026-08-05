"use client";

import { ConversationProvider } from "@elevenlabs/react";
import { ElevenLabsCall, OpenAiCall } from "@/components/adcampaign/live-demo";

type PublicAgent = {
  slug: string;
  name: string;
  provider: "elevenlabs" | "openai";
  headline: string;
  subheadline: string;
  business: string | null;
};

function DemoBody({ agent }: { agent: PublicAgent }) {
  return (
    <div className="w-full max-w-xl">
      <div className="text-center">
        {agent.business && (
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">{agent.business}</p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{agent.headline}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">{agent.subheadline}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Same call surface the ad landing page uses, so a prospect link and a
            paid click behave identically. */}
        {agent.provider === "openai"
          ? <OpenAiCall slug={agent.slug} agentName={agent.name} onStart={() => {}} />
          : <ElevenLabsCall slug={agent.slug} agentName={agent.name} onStart={() => {}} />}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        A live AI receptionist demo by ArkiTech Solutions. Your conversation is processed to run the demo.
      </p>
    </div>
  );
}

export function DemoClient({ agent }: { agent: PublicAgent }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16">
      {agent.provider === "openai" ? (
        <DemoBody agent={agent} />
      ) : (
        <ConversationProvider>
          <DemoBody agent={agent} />
        </ConversationProvider>
      )}
    </main>
  );
}
