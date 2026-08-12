"use client";

import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import type { CampaignAttribution } from "@/lib/campaign";

const FIELD_CLASS =
  "w-full rounded-lg border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-300/60 focus:bg-white/[0.08] sm:py-3";

type ChoiceField = "currentSituation" | "onlinePresence" | "investmentRange" | "startTimeline";

type ChoiceStep = {
  field: ChoiceField;
  eyebrow: string;
  title: string;
  subtitle: string;
  options: string[];
};

const CHOICE_STEPS: ChoiceStep[] = [
  {
    field: "currentSituation",
    eyebrow: "Business stage",
    title: "Which best describes your current situation?",
    subtitle: "This helps us understand whether you need launch support, booking volume, or both.",
    options: [
      "I recently started a business",
      "I am getting ready to launch",
      "I have been open and want more bookings",
      "I am exploring a new growth channel",
    ],
  },
  {
    field: "onlinePresence",
    eyebrow: "Online presence",
    title: "What kind of online presence do you currently have?",
    subtitle: "CleaningBook works best when we can turn existing attention into booked calls.",
    options: [
      "A website and active social media",
      "A website only",
      "Active social media only",
      "No real online presence yet",
    ],
  },
  {
    field: "investmentRange",
    eyebrow: "Growth budget",
    title: "How much capital are you prepared to invest in growing or launching your business?",
    subtitle: "A clear range lets us recommend the right pace instead of overbuilding.",
    options: [
      "$500-$2,500",
      "Under $500",
      "$2,500-$7,500",
      "$7,500+",
    ],
  },
  {
    field: "startTimeline",
    eyebrow: "Timeline",
    title: "If this is the right fit, when are you ready to get started?",
    subtitle: "We use this to prioritize callbacks for people who are ready to move.",
    options: [
      "Within 30 days",
      "As soon as possible",
      "1-3 months",
      "Just researching",
    ],
  },
];

const CONTACT_STEP_INDEX = CHOICE_STEPS.length;
const TOTAL_STEPS = CHOICE_STEPS.length + 1;

type GateForm = {
  currentSituation: string;
  onlinePresence: string;
  investmentRange: string;
  startTimeline: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  company: string;
};

type Status = "idle" | "sending" | "sent" | "error";

function ChoiceButton({
  value,
  selected,
  onSelect,
}: {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`group flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-left text-sm font-bold transition active:scale-[0.99] motion-reduce:transition-none sm:py-4 ${
        selected
          ? "border-cyan-200/70 bg-cyan-300/15 text-white shadow-[0_0_34px_rgba(34,211,238,0.14)]"
          : "border-white/10 bg-white/[0.04] text-white/76 hover:border-cyan-200/45 hover:bg-white/[0.07] hover:text-white"
      }`}
    >
      <span>{value}</span>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
          selected
            ? "border-cyan-200 bg-cyan-200 text-[#07111f]"
            : "border-white/15 text-white/42 group-hover:border-cyan-200/60 group-hover:text-cyan-100"
        }`}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function TextInput({
  label,
  wrapperClassName = "",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={`block ${wrapperClassName}`}>
      <span className="mb-1.5 block text-xs font-semibold text-white/55">{label}</span>
      <input {...props} className={`${FIELD_CLASS} ${className}`} />
    </label>
  );
}

export function QualificationGate({
  attribution,
  onQualified,
}: {
  attribution: CampaignAttribution;
  onQualified: () => void;
}) {
  const advanceTimer = useRef<number | null>(null);
  const [form, setForm] = useState<GateForm>({
    currentSituation: "",
    onlinePresence: "",
    investmentRange: "",
    startTimeline: "",
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    company: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const currentChoiceStep = step < CONTACT_STEP_INDEX ? CHOICE_STEPS[step] : null;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const selectedAnswer = currentChoiceStep ? form[currentChoiceStep.field] : "";

  function update(field: keyof GateForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseOption(field: ChoiceField, value: string) {
    update(field, value);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, CONTACT_STEP_INDEX));
      advanceTimer.current = null;
    }, 160);
  }

  function goBack() {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (currentChoiceStep) {
      if (selectedAnswer) setStep((current) => Math.min(current + 1, CONTACT_STEP_INDEX));
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/campaign/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          formIntent: "gate",
          businessName: `${form.name.trim()} - CleaningBook inquiry`,
          attribution,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Check the form and try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      window.setTimeout(onQualified, 450);
    } catch {
      setError("Network error. Try again, or call (802) 310-3749.");
      setStatus("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qualification-title"
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#050711]/90 px-4 py-5 text-white backdrop-blur-md sm:px-6 sm:py-8"
    >
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        <div
          className="grid w-full overflow-hidden rounded-[28px] border border-white/12 bg-[#0c1020]/95 shadow-[0_40px_140px_rgba(0,0,0,0.72)] lg:grid-cols-[0.86fr_1.14fr]"
          style={{ boxShadow: "0 40px 140px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <div className="relative hidden min-h-[620px] flex-col overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.16),transparent_30%),linear-gradient(155deg,#101827,#070915)] p-8 lg:flex">
            <div className="absolute inset-x-8 top-8 flex items-center justify-between text-xs font-semibold text-white/45">
              <span>CleaningBook</span>
              <span>{step + 1} / {TOTAL_STEPS}</span>
            </div>
            <div className="mt-auto">
              <h2 className="max-w-sm text-4xl font-black leading-[0.98]">
                Unlock the demo one answer at a time.
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/52">
                We use this to tailor the page and make sure the callback is actually useful.
                No spam, no generic sales script.
              </p>
              <div className="mt-8 space-y-2 text-sm">
                {CHOICE_STEPS.map((item, index) => {
                  const value = form[item.field];
                  const active = index === step;

                  return (
                    <div
                      key={item.field}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        active ? "border-cyan-200/30 bg-cyan-300/10" : "border-white/10 bg-white/[0.035]"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${
                          value ? "bg-emerald-300 text-[#07111f]" : "bg-white/8 text-white/55"
                        }`}
                      >
                        {value ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-white/74">{item.eyebrow}</p>
                        <p className="truncate text-xs text-white/42">{value || (active ? "Answering now" : "Coming up")}</p>
                      </div>
                    </div>
                  );
                })}
                <div
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    step === CONTACT_STEP_INDEX ? "border-cyan-200/30 bg-cyan-300/10" : "border-white/10 bg-white/[0.035]"
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/8 text-xs font-black text-white/55">
                    {TOTAL_STEPS}
                  </span>
                  <div>
                    <p className="font-bold text-white/74">Contact</p>
                    <p className="text-xs text-white/42">Name, phone, email, city, state</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="p-5 sm:p-7 lg:p-8">
            <div className="mb-6 lg:hidden">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Quick fit path
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-xs font-bold text-white/45">
                <span>Step {step + 1} of {TOTAL_STEPS}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#34d399)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {currentChoiceStep ? (
              <section key={currentChoiceStep.field} aria-live="polite">
                <p className="text-xs font-bold uppercase text-cyan-200/70">{currentChoiceStep.eyebrow}</p>
                <h1 id="qualification-title" className="mt-3 text-2xl font-black leading-[1.04] text-white sm:text-4xl">
                  {currentChoiceStep.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">{currentChoiceStep.subtitle}</p>

                <div role="group" aria-label={currentChoiceStep.title} className="mt-7 grid gap-3">
                  {currentChoiceStep.options.map((option) => (
                    <ChoiceButton
                      key={option}
                      value={option}
                      selected={selectedAnswer === option}
                      onSelect={(value) => chooseOption(currentChoiceStep.field, value)}
                    />
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white/55 transition hover:border-white/20 hover:text-white disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <p className="text-right text-xs leading-5 text-white/35">Pick the closest fit.</p>
                </div>
              </section>
            ) : (
              <section aria-live="polite">
                <p className="text-xs font-bold uppercase text-cyan-200/70">Last step</p>
                <h1 id="qualification-title" className="mt-3 text-2xl font-black leading-[1.04] text-white sm:text-4xl">
                  Where should we send the fit details?
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">
                  Add your contact info and the CleaningBook page opens right up.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <TextInput
                    required
                    label="Full name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder="Tina West"
                    autoComplete="name"
                  />
                  <TextInput
                    required
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="+1 240 209 1002"
                    autoComplete="tel"
                  />
                  <TextInput
                    required
                    label="Email"
                    wrapperClassName="sm:col-span-2"
                    type="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <div className="grid grid-cols-[1fr_0.82fr] gap-3 sm:col-span-2">
                    <TextInput
                      required
                      label="City"
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                      placeholder="Lanham-Seabrook"
                      autoComplete="address-level2"
                    />
                    <TextInput
                      required
                      label="State"
                      value={form.state}
                      onChange={(event) => update("state", event.target.value)}
                      placeholder="Maryland"
                      autoComplete="address-level1"
                    />
                  </div>
                </div>

                {/* Honeypot - off-screen rather than display:none, which some bots skip. */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={form.company}
                  onChange={(event) => update("company", event.target.value)}
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {error && (
                  <p className="mt-4 rounded-lg border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white motion-reduce:transition-none sm:w-auto"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={status === "sending" || status === "sent"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22d3ee,#34d399)] px-6 py-4 text-base font-black text-[#06111f] shadow-[0_0_48px_rgba(34,211,238,0.25)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
                  >
                    {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {status === "sent" ? <CheckCircle2 className="h-4 w-4" /> : null}
                    {status === "idle" || status === "error" ? <ArrowRight className="h-4 w-4" /> : null}
                    {status === "sending" ? (
                      "Opening your demo..."
                    ) : status === "sent" ? (
                      "You are in"
                    ) : (
                      <>
                        <span className="sm:hidden">Unlock demo</span>
                        <span className="hidden sm:inline">Unlock the CleaningBook demo</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-white/35">
                  By continuing, you agree that ArkiTech can contact you about your inquiry.
                </p>
              </section>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
