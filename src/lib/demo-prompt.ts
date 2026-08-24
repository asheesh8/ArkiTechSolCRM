import { getBrief, UNIVERSAL_REQUIREMENTS, PAGESPEED_FLOOR } from "@/lib/demo-briefs";

/**
 * Builds the prompt a developer pastes into Claude Code to start a demo.
 *
 * The point is not convenience. Left to itself a model reaches for the same
 * defaults every time — Inter, indigo-600, a shadow-lg card grid, three
 * identical service tiles, "Elevate Your Business" — and the result is
 * competent, anonymous, and instantly recognisable as machine-made. That is the
 * thing we are actually trying to prevent.
 *
 * So this is a decision-forcing device dressed as a form. Every field it
 * insists on is a decision a person has to make before a model can flatten it:
 * which typeface, which palette, which real reference, what single action the
 * page exists to produce. The prompt then instructs Claude Code to execute
 * those decisions rather than invent its own. `missingFor` is what enforces it —
 * the prompt cannot be produced from an empty form.
 *
 * The generated prompt also carries prohibitions, because saying "make it look
 * handcrafted" does nothing while saying "do not use Inter" does.
 */

export type PromptAnswers = {
  businessType: string;
  businessName: string;
  town: string;
  whatTheyDo: string;
  customer: string;
  /** The one action the page exists to cause. Everything else is subordinate. */
  primaryAction: string;
  /** Three adjectives. Forces a position rather than "modern and clean". */
  personality: string;
  headingFont: string;
  bodyFont: string;
  /** Named colours or hexes, in the developer's own words. */
  palette: string;
  /** A real site being measured against, from the shelf. */
  reference: string;
  /** Anything specific to this business the generic brief cannot know. */
  specifics: string;
};

export const EMPTY_ANSWERS: PromptAnswers = {
  businessType: "",
  businessName: "",
  town: "",
  whatTheyDo: "",
  customer: "",
  primaryAction: "",
  personality: "",
  headingFont: "",
  bodyFont: "",
  palette: "",
  reference: "",
  specifics: "",
};

export type PromptStep = {
  key: string;
  title: string;
  /** Why this step exists — shown to the developer, not padding. */
  why: string;
  fields: {
    name: keyof PromptAnswers;
    label: string;
    placeholder: string;
    hint?: string;
    multiline?: boolean;
    /** Blocks prompt generation when empty. */
    required?: boolean;
  }[];
};

export const PROMPT_STEPS: PromptStep[] = [
  {
    key: "business",
    title: "The business",
    why: "A demo aimed at nobody reads as a template. Everything downstream depends on this being specific.",
    fields: [
      {
        name: "businessName",
        label: "Business name",
        placeholder: "Sparkle & Co.",
        hint: "Invented is fine — it just has to be a name, not 'Your Business'.",
        required: true,
      },
      { name: "town", label: "Town or city", placeholder: "Burlington, VT", required: true },
      {
        name: "whatTheyDo",
        label: "What they actually do",
        placeholder: "Deep cleans for rented flats between tenants, two-person crew",
        hint: "The specific version, not the category. 'Cleaning services' tells the model nothing.",
        multiline: true,
        required: true,
      },
      {
        name: "customer",
        label: "Who is buying",
        placeholder: "Letting agents managing 10–40 units who need a turnaround in 24h",
        multiline: true,
        required: true,
      },
    ],
  },
  {
    key: "job",
    title: "What the page is for",
    why: "A page that wants five things converts on none of them. Name the one action and the layout has a spine.",
    fields: [
      {
        name: "primaryAction",
        label: "The one action",
        placeholder: "Request a same-week quote",
        hint: "One. Everything else on the page is subordinate to it.",
        required: true,
      },
      {
        name: "specifics",
        label: "Anything the brief can't know",
        placeholder: "They're the only crew in the area insured for mould remediation",
        hint: "The detail a competitor can't copy. This is usually where the page's argument comes from.",
        multiline: true,
      },
    ],
  },
  {
    key: "character",
    title: "Character",
    why: "'Modern and clean' is what everything defaults to. Three sharper words force a position — and a position is what makes a page feel made by someone.",
    fields: [
      {
        name: "personality",
        label: "Three adjectives",
        placeholder: "Meticulous, unfussy, quietly expensive",
        hint: "Avoid modern, clean, professional, sleek. They carry no information.",
        required: true,
      },
      {
        name: "reference",
        label: "A real site you're measuring against",
        placeholder: "https://…",
        hint: "From the shelf. Say what you're taking from it — the density, the type, the restraint.",
        required: true,
      },
    ],
  },
  {
    key: "craft",
    title: "Type and colour",
    why: "The two decisions that carry most of the difference, and the two a model will always default on if you let it. Decide them yourself and it executes rather than invents.",
    fields: [
      {
        name: "headingFont",
        label: "Heading typeface",
        placeholder: "Instrument Serif",
        hint: "From Fontshare or Google Fonts. Not Inter.",
        required: true,
      },
      {
        name: "bodyFont",
        label: "Body typeface",
        placeholder: "Satoshi",
        hint: "Can be the same family at a different weight. Just decide it.",
        required: true,
      },
      {
        name: "palette",
        label: "Palette",
        placeholder: "Warm off-white #F7F4EF, ink #14120F, one accent: oxblood #6B2028",
        hint: "Background, text, and one accent is enough. Not indigo-600.",
        multiline: true,
        required: true,
      },
    ],
  },
];

/** Which required fields are still empty, by step. */
export function missingFor(answers: PromptAnswers): { step: string; label: string }[] {
  const missing: { step: string; label: string }[] = [];
  for (const step of PROMPT_STEPS) {
    for (const field of step.fields) {
      if (field.required && !answers[field.name]?.trim()) {
        missing.push({ step: step.key, label: field.label });
      }
    }
  }
  return missing;
}

/**
 * Compose the prompt.
 *
 * Written as instructions to an agent that will otherwise reach for defaults,
 * so it is deliberately prescriptive and carries an explicit banned list. Vague
 * encouragement ("make it beautiful") changes nothing; naming the specific
 * things that read as machine-made changes a great deal.
 */
export function buildPrompt(answers: PromptAnswers): string {
  const brief = getBrief(answers.businessType);

  const section = (title: string, body: string) => `## ${title}\n${body.trim()}`;

  const parts: string[] = [];

  parts.push(
    `Build a single-page demo site for ${answers.businessName}, a ${brief?.label.toLowerCase() ?? "local business"} in ${answers.town}.

This is a sales demo. It has to look like one person designed it on purpose — not like it came out of a component library. Read every section below before writing any code, and treat the constraints as constraints rather than suggestions.`,
  );

  parts.push(
    section(
      "The business",
      `- What they do: ${answers.whatTheyDo}
- Who is buying: ${answers.customer}
- The one action this page exists to cause: **${answers.primaryAction}**${
        answers.specifics ? `\n- What makes them different: ${answers.specifics}` : ""
      }

Every section on the page must earn its place by moving someone toward that one action. If a section does not, cut it rather than filling it.`,
    ),
  );

  parts.push(
    section(
      "Character",
      `The site should feel: **${answers.personality}**.

Measuring against: ${answers.reference}

Hold that character in every decision — spacing, weight, how much is left empty. A page reads as handcrafted when the same taste shows up in small places, not because of one hero flourish.`,
    ),
  );

  parts.push(
    section(
      "Type and colour — decided, not yours to choose",
      `- Headings: **${answers.headingFont}**
- Body: **${answers.bodyFont}**
- Palette: ${answers.palette}

Load the fonts properly and set a real type scale — pick a ratio and stick to it rather than choosing sizes ad hoc. Body text must pass WCAG AA against its background; check it rather than assuming.`,
    ),
  );

  if (brief) {
    parts.push(
      section(
        `What a ${brief.label.toLowerCase()} demo has to contain`,
        `The angle: ${brief.angle}

Must have:
${brief.mustHave.map((m) => `- ${m}`).join("\n")}

Known failures in this category — do not do these:
${brief.avoid.map((a) => `- ${a}`).join("\n")}`,
      ),
    );
  }

  parts.push(
    section(
      "Non-negotiable",
      UNIVERSAL_REQUIREMENTS.map((r) => `- ${r}`).join("\n") +
        `\n\nMobile PageSpeed must clear ${PAGESPEED_FLOOR}. It is measured before this build can be submitted, so treat it as part of the brief and not as cleanup.`,
    ),
  );

  parts.push(
    section(
      "Do not",
      `These are the specific things that make a page read as machine-made:

- Inter, or the default system sans, for anything. The typefaces are chosen above.
- Tailwind's default indigo/violet/blue accents, or \`shadow-lg\` on cards as the main depth device.
- Three equal feature cards in a row with an icon, a heading and two lines each.
- Headings of the form "Elevate Your X", "Transform Your Y", "Take Your Z to the Next Level".
- Filler body copy that says nothing: "we pride ourselves on quality and customer satisfaction".
- Stock photography of people who are obviously not this business.
- A section that exists only because sites usually have one.
- Emoji as icons.
- Gradient text on the hero heading.

If you find yourself producing any of these because nothing better came to mind, stop and ask me instead.`,
    ),
  );

  parts.push(
    section(
      "How to work",
      `1. Before writing code, tell me in a few lines what the page's argument is and what the section order will be. Wait for me to agree.
2. Then build it. Real copy throughout — no lorem ipsum, and no filler that could belong to any business in this category.
3. Every placeholder person must be unmistakably fictional: Jane Doe, phone numbers in the 555-01xx range.
4. When it is running, tell me what you would change with another day on it.`,
    ),
  );

  return parts.join("\n\n");
}
