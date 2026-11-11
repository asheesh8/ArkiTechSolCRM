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
      "SEO (search engine optimization) helps a page rank in search results. AEO (answer engine optimization) shapes a page so tools like Google AI Overviews and ChatGPT can lift a clear answer from it. GEO (generative engine optimization) aims to get your business cited inside AI-written answers. All three rest on the same thing: useful pages crawlers can read.",
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
];
