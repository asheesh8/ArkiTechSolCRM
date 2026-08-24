"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { DEMO_BRIEFS, getBrief } from "@/lib/demo-briefs";
import {
  PROMPT_STEPS,
  EMPTY_ANSWERS,
  buildPrompt,
  missingFor,
  type PromptAnswers,
} from "@/lib/demo-prompt";

/**
 * Pick a business type, answer four short steps, get a prompt for Claude Code.
 *
 * The steps are not a wizard for the sake of being a wizard. Each one is a
 * decision that has to be made by a person, because if it is left blank the
 * model will fill it with its default and the result is the anonymous,
 * obviously-generated page this whole room exists to prevent. That is why the
 * prompt cannot be produced from an empty form — the gate is the feature.
 */
export function DemoPromptBuilder() {
  const [answers, setAnswers] = useState<PromptAnswers>(EMPTY_ANSWERS);
  const [stepIndex, setStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const brief = getBrief(answers.businessType);
  const missing = useMemo(() => missingFor(answers), [answers]);
  const ready = Boolean(answers.businessType) && missing.length === 0;
  const prompt = useMemo(() => (ready ? buildPrompt(answers) : ""), [ready, answers]);

  const set = (name: keyof PromptAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [name]: value }));
    setCopied(false);
  };

  // ---------------------------------------------------------------- step 0
  if (!answers.businessType) {
    return (
      <div>
        <p className="mb-4 text-sm text-zinc-500">
          Start by picking what you&apos;re building. The brief for that type gets folded into the prompt, so
          Claude Code starts with the standard rather than a blank page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_BRIEFS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => set("businessType", b.key)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] text-left transition hover:border-[var(--accent)] focus:border-[var(--accent)] focus:outline-none"
            >
              <Image
                src={b.cover}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                // The covers are deliberately low-key editorial stills, which on a
                // dark surface under a scrim read as solid black. Lifted here
                // rather than baked into the files so the source stays neutral.
                style={{ filter: "brightness(1.45) contrast(1.02) saturate(0.92)" }}
              />
              {/* Scrim, so the label stays readable whatever the image does. */}
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(8,8,11,0.90) 0%, rgba(8,8,11,0.55) 42%, rgba(8,8,11,0.10) 100%)" }}
              />
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-sm font-semibold text-white">{b.label}</span>
                <span className="mt-1 block text-xs leading-5 text-white/60">{b.angle}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const step = PROMPT_STEPS[stepIndex];
  const isLast = stepIndex === PROMPT_STEPS.length - 1;

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------ header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {brief ? (
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
              <Image src={brief.cover} alt="" aria-hidden="true" fill sizes="44px" className="object-cover" />
            </span>
          ) : null}
          <span>
            <span className="block text-sm font-semibold">{brief?.label}</span>
            <span className="block text-xs text-zinc-500">
              Step {stepIndex + 1} of {PROMPT_STEPS.length} · {step.title}
            </span>
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAnswers(EMPTY_ANSWERS);
            setStepIndex(0);
          }}
        >
          Start over
        </Button>
      </div>

      {/* ---------------------------------------------------------- progress */}
      <div className="flex gap-1.5">
        {PROMPT_STEPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStepIndex(i)}
            aria-label={`Go to step ${i + 1}: ${s.title}`}
            className="h-1 flex-1 rounded-full transition"
            style={{ background: i <= stepIndex ? "var(--accent)" : "var(--border)" }}
          />
        ))}
      </div>

      {/* -------------------------------------------------------------- step */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm font-semibold">{step.title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{step.why}</p>

        <div className="mt-4 space-y-4">
          {step.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? <span className="ml-1 text-red-500">*</span> : null}
              </Label>
              {field.multiline ? (
                <Textarea
                  id={field.name}
                  className="mt-1.5 min-h-20"
                  placeholder={field.placeholder}
                  value={answers[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              ) : (
                <Input
                  id={field.name}
                  className="mt-1.5"
                  placeholder={field.placeholder}
                  value={answers[field.name]}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              )}
              {field.hint ? <p className="mt-1 text-xs text-zinc-500">{field.hint}</p> : null}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- moves */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        {!isLast ? (
          <Button type="button" onClick={() => setStepIndex((i) => i + 1)}>
            Next
          </Button>
        ) : null}
        {missing.length > 3 ? (
          <span className="text-xs text-zinc-500">{missing.length} answers still needed</span>
        ) : missing.length > 0 ? (
          <span className="text-xs text-zinc-500">
            Still needed: {missing.map((m) => m.label).join(", ")}
          </span>
        ) : null}
      </div>

      {/* ------------------------------------------------------------ output */}
      {ready ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
            <div>
              <p className="text-sm font-semibold">Your prompt</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Paste into Claude Code in an empty project. It will come back with a plan before it writes
                anything — read it, push back, then let it build.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(prompt).then(
                  () => setCopied(true),
                  () => setCopied(false),
                );
              }}
            >
              {copied ? "Copied" : "Copy prompt"}
            </Button>
          </div>
          <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-5 whitespace-pre-wrap text-zinc-400">
            {prompt}
          </pre>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">
          The prompt appears once every required field is answered. That&apos;s deliberate — an unanswered
          field is one Claude Code will fill with its default, and its defaults are what make a page look
          machine-made.
        </p>
      )}
    </div>
  );
}
