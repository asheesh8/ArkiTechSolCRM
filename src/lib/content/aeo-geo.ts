import type { ContentPage } from "@/lib/content/types";
import { SOURCES as S } from "@/lib/content/sources";

/**
 * /aeo-geo guides. Plain answers about answer engine optimization (AEO) and
 * generative engine optimization (GEO) for small business owners. Never
 * promise that anyone will appear in ChatGPT or any AI answer.
 */
export const AEO_GEO_GUIDES: ContentPage[] = [
  {
    slug: "seo-vs-aeo-vs-geo",
    path: "/aeo-geo/seo-vs-aeo-vs-geo",
    title: "SEO vs AEO vs GEO: What's the Difference? | ArkiTech",
    description:
      "SEO helps a page rank in search results, AEO helps an answer engine lift your answer, and GEO helps AI-written answers cite your business. How they differ.",
    kicker: "AEO & GEO guide",
    h1: "SEO vs AEO vs GEO: what's the difference?",
    quickAnswer:
      "SEO (search engine optimization) helps a page rank in search results. AEO (answer engine optimization) helps tools like Google AI Overviews and ChatGPT lift a clear answer from it. GEO (generative engine optimization) aims to get your business cited in AI-written answers. All three rest on useful pages crawlers can read.",
    sections: [
      {
        h2: "What is SEO?",
        blocks: [
          {
            p: "SEO is the work of helping a page show up in search results like Google's and Bing's. It covers what the page says, how it's built, how fast it loads, and how other sites refer to it. For a local business, it also covers the Google Business Profile, which is what shows up on the map.",
          },
          {
            p: "Google says local results are mainly based on relevance, distance and prominence, and that you can't pay for a better local ranking. [Google's own explanation](" +
              S.googleLocalRanking.href +
              ") is worth reading in full.",
          },
        ],
      },
      {
        h2: "What is AEO?",
        blocks: [
          {
            p: "AEO is writing and structuring pages so an answer engine can take a direct answer from them. Answer engines are tools that reply to a question instead of listing links: Google's AI Overviews, ChatGPT, Perplexity, Gemini and Claude.",
          },
          {
            list: [
              "Headings phrased as the questions people ask.",
              "A short, direct answer right under each question, then the detail.",
              "Facts stated plainly, the same way everywhere they appear.",
              "Pages a crawler can read without running scripts.",
            ],
          },
        ],
      },
      {
        h2: "What is GEO?",
        blocks: [
          {
            p: "GEO is the wider goal of being cited when an AI tool writes an answer, not only having a sentence lifted. Generative engines pull from many sources at once: your website, your Google Business Profile, directories, reviews and articles that mention you. When those sources agree with each other, an answer engine has a clearer picture of your business to draw on.",
          },
          {
            p: "[Search Engine Land's look at how ChatGPT runs local searches](" +
              S.selChatgptLocal.href +
              ") and [BrightLocal's study of ChatGPT search sources](" +
              S.brightlocalChatgptSources.href +
              ") both show business websites and listings among the sources ChatGPT draws on for local questions.",
          },
        ],
      },
      {
        h2: "How do SEO, AEO and GEO compare?",
        blocks: [
          {
            table: {
              caption: "SEO, AEO and GEO side by side",
              head: ["", "SEO", "AEO", "GEO"],
              rows: [
                ["Goal", "Rank in search results", "Have your answer quoted directly", "Be cited in AI-written answers"],
                ["Where it shows", "Google and Bing results, the map", "AI Overviews, featured answers, chat replies", "ChatGPT, Perplexity, Gemini, Claude, Google AI Mode"],
                [
                  "What helps",
                  "Relevant pages, speed, links, a complete Business Profile",
                  "Question headings, direct answers, FAQ sections",
                  "Consistent facts across your site, listings and reviews",
                ],
                ["How you check it", "Search Console, rankings", "Search the question and see whose answer shows", "Ask the AI tools and note who they cite"],
              ],
            },
          },
        ],
      },
      {
        h2: "Do I need special code or files for AI search?",
        blocks: [
          {
            p: "Not for Google. Google says a page only has to be indexed and eligible to show a snippet in Search to appear as a link in AI Overviews or AI Mode, and that there's no special markup or AI text file to add. [Read Google's guidance](" +
              S.googleAiFeatures.href +
              ").",
          },
          {
            p: "For ChatGPT, OpenAI says its search features use a crawler called OAI-SearchBot, and that a site which blocks it won't show up in ChatGPT search answers. [OpenAI's crawler documentation](" +
              S.openaiBots.href +
              ") lists each crawler and what it's for.",
          },
        ],
      },
      {
        h2: "What do the AEO and GEO terms mean?",
        blocks: [
          {
            list: [
              "Answer engine: a tool that replies to a question with an answer instead of a list of links.",
              "AI Overview: the AI-written summary Google shows above some search results.",
              "Citation: a link or mention an AI answer gives as its source.",
              "Crawler: the program a search or AI company uses to read web pages.",
              "Structured data (schema): code on a page that states facts like your name, address and prices in a form machines read.",
              "llms.txt: an optional plain-text summary of a site for AI tools. Google says it isn't needed for AI features.",
            ],
          },
        ],
      },
      { blocks: [{ sources: [S.googleLocalRanking, S.googleAiFeatures, S.openaiBots, S.selChatgptLocal, S.brightlocalChatgptSources] }], h2: "Where does this come from?" },
    ],
    faqs: [
      {
        q: "Is AEO the same as SEO?",
        a: "No, but they overlap. SEO is about ranking in search results; AEO is about having your answer quoted by an answer engine. The groundwork is shared: pages that are useful, clearly written and easy for crawlers to read. Google says its AI features are built on its core search systems.",
      },
      {
        q: "Is GEO replacing SEO?",
        a: "No. People still search Google and click results, and AI tools draw on the same web pages search engines index. GEO adds a goal on top of SEO: being cited inside AI-written answers. A business that ignores SEO usually has little for an AI tool to cite.",
      },
      {
        q: "Can anyone guarantee my business appears in ChatGPT?",
        a: "No. ChatGPT, Google and the other AI tools decide what they show, and they change how they decide. Anyone promising placement is guessing. What can be done is making your pages clear, accurate and easy to cite, and keeping your facts the same everywhere.",
      },
    ],
    related: [
      { href: "/services/ai-search", label: "The AEO & GEO Website Build" },
      { href: "/aeo-geo/does-a-small-business-need-aeo-geo", label: "Does a small business need AEO and GEO?" },
      { href: "/aeo-geo/how-to-get-recommended-by-chatgpt", label: "How to get recommended by ChatGPT" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "does-a-small-business-need-aeo-geo",
    path: "/aeo-geo/does-a-small-business-need-aeo-geo",
    title: "Does My Small Business Need AEO and GEO? | ArkiTech",
    description:
      "Most small businesses need the basics of AEO and GEO: clear answers, the same facts everywhere, and a complete Google profile. When a bigger build pays off.",
    kicker: "AEO & GEO guide",
    h1: "Does a small business need AEO and GEO?",
    quickAnswer:
      "Most small businesses need the basics, not a big project: a fast website that answers customers' questions plainly, the same facts on every listing, and a complete Google Business Profile with genuine reviews. A bigger AEO and GEO build pays off when customers ask many detailed questions before they buy.",
    sections: [
      {
        h2: "What do AEO and GEO mean for a small business?",
        blocks: [
          {
            p: "AEO (answer engine optimization) is making your pages easy for tools like ChatGPT and Google AI Overviews to quote. GEO (generative engine optimization) is being cited when those tools write an answer. For a small business, both come down to whether an AI tool can find clear, consistent facts about what you do, where, and for how much. [SEO vs AEO vs GEO](/aeo-geo/seo-vs-aeo-vs-geo) explains the difference in more detail.",
          },
        ],
      },
      {
        h2: "Do AI tools use small business websites at all?",
        blocks: [
          {
            p: "Yes. [BrightLocal's study of ChatGPT search sources](" +
              S.brightlocalChatgptSources.href +
              ") found business websites were the most common kind of source in ChatGPT's local results, ahead of directories. [Search Engine Land argues](" +
              S.selWebsiteSourceOfTruth.href +
              ") that AI tools check your website against your listings and reviews, so a site that states the facts plainly gives them something to confirm.",
          },
        ],
      },
      {
        h2: "What should every small business do first?",
        blocks: [
          {
            list: [
              "Make sure the website loads fast on a phone and its words are in the page itself, not loaded later by scripts.",
              "State your services, the towns you serve, your hours and your phone number in plain text.",
              "Write headings as the questions customers ask, with a short answer under each.",
              "Claim your Google Business Profile, Bing Places, Apple Business Connect and Yelp, and use the same name, phone and address on all of them.",
              "Ask every customer for a review, and reply to the reviews you get.",
              "Check that your site isn't blocking the crawlers AI search tools use, such as OpenAI's OAI-SearchBot.",
            ],
          },
        ],
      },
      {
        h2: "When is a bigger AEO and GEO build worth it?",
        blocks: [
          {
            p: "When the questions customers ask before buying outnumber the pages you have. A business with many services, many towns, or a purchase people research carefully can have dozens of questions worth a proper answer each. That's what our [AEO & GEO Website Build](/services/ai-search) is for: 200 unique pages, each written to answer a real question well.",
          },
          {
            p: "What doesn't work is volume for its own sake. Pages that repeat the same text with a different keyword swapped in give an answer engine nothing new to cite.",
          },
        ],
      },
      {
        h2: "What can't AEO and GEO do?",
        blocks: [
          {
            list: [
              "Guarantee a place in ChatGPT, Google AI Overviews or any other AI answer. Those tools decide, and they change how.",
              "Make up for a poor reputation. AI tools read reviews too.",
              "Replace the basics. Google says its AI features draw on its core search systems, so a site that's weak in search is usually weak in AI answers.",
            ],
          },
        ],
      },
      { h2: "Where does this come from?", blocks: [{ sources: [S.brightlocalChatgptSources, S.selWebsiteSourceOfTruth, S.googleAiFeatures, S.openaiBots] }] },
    ],
    faqs: [
      {
        q: "How much does AEO and GEO cost?",
        a: "The basics in this guide you can do yourself for free. Our AEO & GEO Website Build is a $3,000 one-time project: 200 unique pages written to be found and cited by answer engines. After it, you choose a hosting plan or own the site outright.",
        link: { href: "/pricing", label: "See every plan" },
      },
      {
        q: "If I already rank on Google, do I need AEO and GEO?",
        a: "Ranking well is a strong start, because Google says its AI features are built on its core search systems. AI tools also weigh listings and reviews, and they answer questions you may not have pages for. If customers ask detailed questions before buying, answering them directly is worth it.",
      },
      {
        q: "Is AEO and GEO just for big companies?",
        a: "No. Local answers lean on local facts: your services, your towns, your hours and your reviews. A small business that states those clearly and keeps them the same everywhere is often easier for an AI tool to describe accurately than a large one with scattered pages.",
      },
    ],
    related: [
      { href: "/aeo-geo/seo-vs-aeo-vs-geo", label: "SEO vs AEO vs GEO: what's the difference?" },
      { href: "/aeo-geo/how-to-get-recommended-by-chatgpt", label: "How to get recommended by ChatGPT" },
      { href: "/services/ai-search", label: "The AEO & GEO Website Build" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  {
    slug: "how-to-get-recommended-by-chatgpt",
    path: "/aeo-geo/how-to-get-recommended-by-chatgpt",
    title: "How to Get Your Business Recommended by ChatGPT | ArkiTech",
    description:
      "There's no way to pay ChatGPT for a recommendation. What helps: a clear website, accurate listings, genuine reviews, and not blocking OpenAI's search crawler.",
    kicker: "AEO & GEO guide",
    h1: "How to get your business recommended by ChatGPT",
    quickAnswer:
      "You can't pay or submit your way into ChatGPT's recommendations. What helps is being easy to find and trust: a website that says what you do, where and for how much; the same details on Google, Bing, Apple and Yelp; genuine reviews; and not blocking OAI-SearchBot, ChatGPT's search crawler.",
    sections: [
      {
        h2: "Can I pay to be recommended by ChatGPT?",
        blocks: [
          {
            p: "No. There's no paid placement and no form to submit your business. OpenAI's [publisher FAQ](" +
              S.openaiPublisherFaq.href +
              ") says the way to be included in ChatGPT's search summaries and snippets is to make sure your site isn't blocking its search crawler, OAI-SearchBot. Be wary of any service that promises a ChatGPT listing for a fee.",
          },
        ],
      },
      {
        h2: "Where does ChatGPT get local business information?",
        blocks: [
          {
            p: "From the web: business websites, directories and listings, review sites, and articles that mention businesses. [BrightLocal's study](" +
              S.brightlocalChatgptSources.href +
              ") found business websites were the most common source type in ChatGPT's local results, and [Search Engine Land's look at ChatGPT local searches](" +
              S.selChatgptLocal.href +
              ") shows how it picks businesses for a local question. What you publish about yourself, and what others say about you, both count.",
          },
        ],
      },
      {
        h2: "What are the steps?",
        blocks: [
          {
            list: [
              "Check your robots.txt allows OAI-SearchBot. OpenAI's [crawler documentation](" + S.openaiBots.href + ") explains each crawler.",
              "Put your services, the towns you serve, your prices, hours and phone number on your website in plain text.",
              "Add pages that answer the questions customers ask before they hire someone like you, with a direct answer first.",
              "Claim and complete Google Business Profile, Bing Places, Apple Business Connect, Yelp and Facebook, with the same name, address and phone everywhere.",
              "Ask every customer for a review, and reply to them. Never buy or reward reviews.",
              "Get mentioned where your town looks: the local chamber of commerce, local news, community and industry directories.",
            ],
          },
        ],
      },
      {
        h2: "How do I check whether ChatGPT recommends my business?",
        blocks: [
          {
            p: "Ask it what a customer would, the way they would: \"Who's a good landscaper in Essex, Vermont?\" Use a new chat, note which businesses it names and which sources it links, and try a few phrasings. Answers vary between people and from week to week, so check every month or so rather than reading too much into one try.",
          },
        ],
      },
      {
        h2: "What doesn't work?",
        blocks: [
          {
            list: [
              "Fake or bought reviews. The FTC bans them, with civil penalties: see the [FTC's rule on reviews](" + S.ftcReviewRule.href + ").",
              "Stuffing keywords or town names into pages that say nothing new.",
              "Relying on an AI text file alone. Google says no special files or markup are needed for its AI features.",
              "Paying for a service that promises placement in AI answers. Nobody controls that.",
            ],
          },
        ],
      },
      {
        h2: "Where does this come from?",
        blocks: [{ sources: [S.openaiPublisherFaq, S.openaiBots, S.brightlocalChatgptSources, S.selChatgptLocal, S.brightlocalAiTips, S.ftcReviewRule, S.googleAiFeatures] }],
      },
    ],
    faqs: [
      {
        q: "If I block GPTBot, will I disappear from ChatGPT search?",
        a: "Not necessarily. OpenAI says its crawlers are set separately: GPTBot relates to training its models, while OAI-SearchBot is the crawler that surfaces websites in ChatGPT search. A site can block GPTBot and still allow OAI-SearchBot.",
      },
      {
        q: "Does an llms.txt file get me into ChatGPT?",
        a: "Not on its own. OpenAI's crawler documentation doesn't ask for one, and Google says no special AI text files are needed for its AI features. It does no harm, and we publish one, but the website, listings and reviews matter far more.",
      },
      {
        q: "How long before ChatGPT mentions my business?",
        a: "There's no reliable timeline, and anyone who gives you one is guessing. OpenAI notes changes to robots.txt can take around a day to take effect for search, but whether and when your business is recommended depends on what ChatGPT finds about you and how it chooses to answer.",
      },
    ],
    related: [
      { href: "/aeo-geo/does-a-small-business-need-aeo-geo", label: "Does a small business need AEO and GEO?" },
      { href: "/local-seo/google-reviews", label: "How to get more Google reviews, the right way" },
      { href: "/services/ai-search", label: "The AEO & GEO Website Build" },
      { href: "/pricing", label: "Plans and pricing" },
    ],
    published: "2026-11-11",
    updated: "2026-11-11",
  },
  // ------------------------------------------------------------------ Drafts
  ...[
    {
      slug: "google-ai-overviews-local-business",
      h1: "Google AI Overviews and your local business",
      title: "Google AI Overviews for Local Businesses: A Guide | ArkiTech",
      description:
        "What Google AI Overviews and AI Mode mean for a local business: how pages get shown as links, what Google says you need, and how to see if you appear.",
      questions: ["What are AI Overviews and AI Mode?", "How does a page get linked in an AI Overview?", "Do I need special markup?", "How do I see whether my site appears?"],
    },
    {
      slug: "200-pages-vs-thin-content",
      h1: "200 useful pages vs thin content: what's the difference?",
      title: "200 Useful Pages vs Thin Content: What Counts? | ArkiTech",
      description:
        "Why 200 genuinely useful pages help a business get found and cited, while hundreds of near-identical keyword pages don't, and how to tell the two apart.",
      questions: ["What is thin content?", "What makes a page worth citing?", "How are the 200 pages different from each other?", "How do you avoid doorway pages?"],
    },
  ].map(
    (d): ContentPage => ({
      slug: d.slug,
      path: `/aeo-geo/${d.slug}`,
      title: d.title,
      description: d.description,
      kicker: "AEO & GEO guide",
      h1: d.h1,
      quickAnswer: "This guide is still being written. The outline below shows the questions it will answer.",
      sections: d.questions.map((h2) => ({ h2, blocks: [{ todo: "write this section, with sources for any claim." }] })),
      related: [{ href: "/aeo-geo", label: "All AEO & GEO guides" }],
      published: "2026-11-11",
      updated: "2026-11-11",
      noindex: true,
    }),
  ),
];
