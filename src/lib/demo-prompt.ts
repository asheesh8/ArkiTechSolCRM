import { getBrief, UNIVERSAL_REQUIREMENTS, PAGESPEED_FLOOR } from "@/lib/demo-briefs";

/**
 * Turns a compact, source-backed intake into the implementation brief used by
 * the developer. Business evidence can be collected automatically; only the
 * business name, offer, and primary conversion action block generation.
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

/** Which required fields are still empty, by step. */
export function missingFor(answers: PromptAnswers): { step: string; label: string }[] {
  return [
    ["business", "Business name", answers.businessName],
    ["business", "What they do", answers.whatTheyDo],
    ["job", "Primary action", answers.primaryAction],
  ]
    .filter(([, , value]) => !value.trim())
    .map(([step, label]) => ({ step, label }));
}

/**
 * Compose the developer brief.
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
    `Work as a senior web designer, UI designer, and front-end engineer. Build a polished demo site for ${answers.businessName}, a ${brief?.label.toLowerCase() ?? "local business"}${answers.town ? ` in ${answers.town}` : ""}.

This is a client-facing sales demo. It must feel deliberately art-directed and professionally engineered, never like an AI product, prompt interface, chatbot, or component-library sample. Read the source material before writing code and treat the constraints below as the working specification.`,
  );

  parts.push(
    section(
      "The business",
      `- What they do: ${answers.whatTheyDo}
- Who is buying: ${answers.customer || brief?.audience || "Infer carefully from the supplied business evidence."}
- The one action this page exists to cause: **${answers.primaryAction}**${
        answers.specifics ? `\n- What makes them different: ${answers.specifics}` : ""
      }

Every section on the page must earn its place by moving someone toward that one action. If a section does not, cut it rather than filling it.`,
    ),
  );

  parts.push(section(
    "Art direction",
    `${answers.personality ? `The site should feel: **${answers.personality}**.` : "Establish a specific visual point of view from the real business, audience, and source material. Avoid generic 'modern and clean' styling."}
${answers.reference ? `\nPrimary reference: ${answers.reference}` : ""}

Hold the same point of view across typography, spacing, imagery, interaction, and copy. It should look like a web designer made a series of connected decisions, not like software assembled sections.`,
  ));

  parts.push(
    section(
      "Design system",
      `- Headings: **${answers.headingFont || "Choose a distinctive, appropriate display family - never Inter by default."}**
- Body: **${answers.bodyFont || "Choose a highly legible companion family."}**
- Palette: ${answers.palette || "Derive a restrained palette from the source logo and photography; document the final tokens."}

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
- Chat bubbles, prompt boxes, sparkle motifs, neural-network graphics, glowing AI gradients, or any other visual shorthand for AI software.

If you find yourself producing any of these because nothing better came to mind, stop and ask me instead.`,
    ),
  );

  parts.push(
    section(
      "How to work",
      `1. Inspect the supplied source, assets, and references first. State the page argument and section order in a short implementation note, then proceed unless a real blocker requires a decision.
2. Build the complete experience with real copy throughout - no lorem ipsum and no filler that could belong to any business in the category.
3. Work mobile-first, then refine desktop composition and interaction.
4. Every placeholder person must be unmistakably fictional: Jane Doe and phone numbers in the 555-01xx range.
5. Finish as an engineer: accessibility, responsive behavior, metadata, image treatment, and performance are part of the build rather than cleanup.`,
    ),
  );

  return parts.join("\n\n");
}
