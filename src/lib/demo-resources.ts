/**
 * The shelf. Where to go instead of reaching for the default.
 *
 * This exists because of a specific failure mode: a build that is technically
 * fine and completely anonymous. Default shadows, default indigo, a button that
 * looks like every other button, Inter at three weights. Nothing is wrong with
 * it and nobody remembers it.
 *
 * Every entry is here because it answers a question that comes up while
 * building, and the note says which question. A link with no note is a
 * bookmark; a link with a note is an instruction. Deliberately excludes the
 * scroll-animation and gimmick-library end of things — those produce the
 * opposite problem, which is a demo that is memorable for the wrong reason.
 *
 * All URLs were checked before landing. A few (Uiverse, SecurityHeaders,
 * WebPageTest, Land-book) refuse automated requests and can only be verified in
 * a browser, so if one ever looks broken from a script, it probably isn't.
 */

export type Resource = {
  label: string;
  href: string;
  /** Why it is on the shelf, and when to reach for it. */
  note: string;
};

export type ResourceGroup = {
  key: string;
  label: string;
  blurb: string;
  items: Resource[];
};

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    key: "inspiration",
    label: "Look at real work first",
    blurb:
      "Before opening an editor. Twenty minutes here is the difference between designing and defaulting.",
    items: [
      {
        label: "Dribbble",
        href: "https://dribbble.com",
        note: "Widest net for visual direction. Treat it as a mood source, not a spec — plenty of it is unbuildable and none of it has to survive real content.",
      },
      {
        label: "Awwwards",
        href: "https://www.awwwards.com",
        note: "The ambitious end. Useful for seeing how far typography and motion can be pushed before a site stops being usable.",
      },
      {
        label: "Land-book",
        href: "https://land-book.com",
        note: "Landing pages only, and they are real shipped sites rather than concepts. Closest to what a demo actually has to be.",
      },
      {
        label: "Godly",
        href: "https://godly.website",
        note: "Tightly curated and small. Good when Dribbble is producing too much noise to think.",
      },
      {
        label: "SiteInspire",
        href: "https://www.siteinspire.com",
        note: "Filterable by industry and style. The fastest way to see what a good site in your business type looks like.",
      },
      {
        label: "Mobbin",
        href: "https://mobbin.com",
        note: "Real screens from real apps, organised by flow. Reach for it when the question is 'how should this booking step behave', not 'what colour'.",
      },
      {
        label: "One Page Love",
        href: "https://onepagelove.com",
        note: "Single-page sites. Most demos are one page, so the structural patterns here transfer directly.",
      },
      {
        label: "Refero",
        href: "https://refero.design",
        note: "Searchable by UI element — 'pricing', 'testimonial', 'empty state'. For when one specific section is not working.",
      },
    ],
  },
  {
    key: "components",
    label: "Components & buttons",
    blurb:
      "A default button is the single clearest tell that nobody made a decision. Fix that one thing first.",
    items: [
      {
        label: "Uiverse — buttons",
        href: "https://uiverse.io/buttons",
        note: "Hundreds of community CSS buttons, copy-paste. The fastest cure for a stock button. Take the idea and retune it to the palette — pasting one unchanged is its own kind of generic.",
      },
      {
        label: "shadcn/ui",
        href: "https://ui.shadcn.com",
        note: "Copy-in React components you then own and edit. The right starting point for anything with state — dialogs, comboboxes, forms.",
      },
      {
        label: "Radix Primitives",
        href: "https://www.radix-ui.com/primitives",
        note: "Unstyled and accessible. Use when the design is genuinely custom but you refuse to reimplement focus traps and keyboard handling.",
      },
      {
        label: "Headless UI",
        href: "https://headlessui.com",
        note: "Same idea, smaller surface, made by the Tailwind team. Fine for menus, tabs, and transitions.",
      },
    ],
  },
  {
    key: "type",
    label: "Type",
    blurb:
      "The highest-leverage change on any demo. Two well-chosen faces will do more than a week of layout tweaks.",
    items: [
      {
        label: "Fonts In Use",
        href: "https://fontsinuse.com/",
        note: "Typefaces shown in real published work, tagged by industry and era. Use it to answer 'what should a cleaning company sound like', not just 'what looks nice'.",
      },
      {
        label: "Fontshare",
        href: "https://fontshare.com",
        note: "Free-for-commercial-use faces with actual personality. The quickest escape from the default sans.",
      },
      {
        label: "Google Fonts",
        href: "https://fonts.google.com",
        note: "Safe, free, fast. Go past the first row — the defaults are defaults because everyone stops there.",
      },
      {
        label: "Modern Font Stacks",
        href: "https://modernfontstacks.com",
        note: "System-font stacks that load in zero bytes. Worth considering on a demo whose PageSpeed score is guaranteed.",
      },
      {
        label: "Type Scale",
        href: "https://typescale.com",
        note: "Pick a ratio and get a consistent set of sizes. Stops the h1/h2/h3 sizes from being three arbitrary numbers.",
      },
    ],
  },
  {
    key: "colour",
    label: "Colour & icons",
    blurb: "Where the other half of 'this looks generic' comes from.",
    items: [
      {
        label: "Realtime Colors",
        href: "https://realtimecolors.com",
        note: "Try a palette on a real layout instead of on swatches. Catches the combination that looked fine as five circles and awful as a page.",
      },
      {
        label: "Happy Hues",
        href: "https://www.happyhues.co",
        note: "Palettes shown in context with which colour goes where. Solves the usual problem of having five colours and no plan.",
      },
      {
        label: "Coolors",
        href: "https://coolors.co",
        note: "Fast palette generation when you need somewhere to start.",
      },
      {
        label: "WebAIM Contrast Checker",
        href: "https://webaim.org/resources/contrastchecker/",
        note: "Non-negotiable. Grey-on-grey body text fails here and it is the most common accessibility miss in a good-looking demo.",
      },
      {
        label: "Lucide",
        href: "https://lucide.dev/icons",
        note: "What this CRM already uses. Consistent stroke weight, no licensing questions.",
      },
      {
        label: "Phosphor",
        href: "https://phosphoricons.com",
        note: "Six weights of the same icon set. Useful when Lucide's single weight fights the typography.",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    blurb:
      "A demo becomes a client site. Anything with a form or a login is worth ten minutes here before it ships.",
    items: [
      {
        label: "OWASP Cheat Sheet Series",
        href: "https://cheatsheetseries.owasp.org",
        note: "The practical one. Short, specific pages on input validation, auth, file upload, headers. Start here, not at the Top Ten.",
      },
      {
        label: "OWASP Top Ten",
        href: "https://owasp.org/www-project-top-ten/",
        note: "The categories themselves. Read once so the cheat sheets have somewhere to hang.",
      },
      {
        label: "SecurityHeaders.com",
        href: "https://securityheaders.com",
        note: "Paste a URL, get a grade on your response headers. A minute's work and usually a free improvement.",
      },
      {
        label: "MDN Observatory",
        href: "https://developer.mozilla.org/en-US/observatory",
        note: "Deeper scan with explanations of what each finding actually means.",
      },
    ],
  },
  {
    key: "performance",
    label: "Performance",
    blurb: "We guarantee 90+ on mobile in public. These are the tools that get you there.",
    items: [
      {
        label: "PageSpeed Insights",
        href: "https://pagespeed.web.dev",
        note: "The exact scorer the submission gate uses. Run it yourself before submitting and there are no surprises.",
      },
      {
        label: "Squoosh",
        href: "https://squoosh.app",
        note: "Compress and convert images in the browser. Oversized images are the number one reason a demo misses the mobile number.",
      },
      {
        label: "WebPageTest",
        href: "https://www.webpagetest.org",
        note: "When PageSpeed says it is slow but not why. Filmstrip and waterfall show what is actually blocking.",
      },
      {
        label: "Bundlephobia",
        href: "https://bundlephobia.com",
        note: "Check the cost of a package before installing it. Worth doing every time for anything client-side.",
      },
    ],
  },
  {
    key: "repos",
    label: "Repos worth reading",
    blurb:
      "Not libraries to install — references to consult when you are unsure what good looks like.",
    items: [
      {
        label: "goldbergyoni/nodebestpractices",
        href: "https://github.com/goldbergyoni/nodebestpractices",
        note: "Several hundred practices with the reasoning attached. The error-handling and project-structure sections are the ones that change how you write.",
      },
      {
        label: "OWASP/CheatSheetSeries",
        href: "https://github.com/OWASP/CheatSheetSeries",
        note: "The cheat sheets as a repo, so you can grep them offline.",
      },
      {
        label: "shadcn-ui/ui",
        href: "https://github.com/shadcn-ui/ui",
        note: "Read the component source even when not installing. It is a good model for accessible components that stay editable.",
      },
      {
        label: "goldbergyoni/javascript-testing-best-practices",
        href: "https://github.com/goldbergyoni/javascript-testing-best-practices",
        note: "How to write a test that still means something in six months.",
      },
      {
        label: "airbnb/javascript",
        href: "https://github.com/airbnb/javascript",
        note: "The style guide most conventions descend from. Useful for settling an argument about why something is written a particular way.",
      },
      {
        label: "GoogleChrome/lighthouse",
        href: "https://github.com/GoogleChrome/lighthouse",
        note: "The audits are documented in the source. When a score is confusing, the definition of the audit is in here.",
      },
      {
        label: "sindresorhus/awesome",
        href: "https://github.com/sindresorhus/awesome",
        note: "The index of every other awesome list. Where to go when the thing you need is not on this shelf.",
      },
    ],
  },
];
