# SEO, AEO and GEO work: summary

Branch `seo-aeo-geo`, 12 commits (one per task), cut from `main` at `95975c8`. Nothing has been pushed, merged or deployed, and no DNS, Vercel or Squarespace settings were touched.

## Tasks

| # | Task | Status | Acceptance check |
|---|---|---|---|
| 1 | Site facts config | Done | `src/lib/marketing/site.ts` drives footer NAP, schema, llms.txt and the About page; old emails and hours only remain where listed below |
| 2 | Canonical domain and redirects | Done | `/service-areas/burlington` no longer 308s to `/about`; www to apex is a permanent redirect in code; every generated URL uses `https://arkitech-sol.com` |
| 3 | Metadata per page | Done | All 38 public routes have a 50–60 character title, a 140–160 character description, one H1 and a self-referencing canonical |
| 4 | JSON-LD components | Done | Every block parses; every Offer has a numeric `price` (samples below) |
| 5 | robots.txt, sitemap, llms.txt | Done | Sitemap lists all 34 indexable routes with `lastmod`, no drafts; robots names the AI bots; llms.txt has AEO, GEO and the three plans with prices; `/llms-full.txt` added |
| 6 | Pricing page rewrite | Done | AEO and GEO in the HTML; numeric Offer prices; the 6 visible questions match the FAQPage schema word for word |
| 7 | Page templates | Done | Guide, compare, industry, town, case study, hub and service templates; one sample of each built cleanly |
| 8 | Priority pages | Done | Priority URLs return 200 with one H1, a 40–60 word quick answer, question H2s and the right JSON-LD; drafts are noindex and absent from the sitemap |
| 9 | FAQ hub | Done | Answers are 40–80 words and match the offers; FAQPage schema is built from the same array |
| 10 | Copy and positioning | Done | AEO and GEO appear on home, /services, /pricing, /faq and the AEO page; no NAP block uses the 310 number |
| 11 | Internal links | Done | Footer has AEO & GEO, Local SEO, Service areas, Work; town and case study templates have related links |
| 12 | Images and alt text | Done | No meaningful image lacks alt text; every image has dimensions |

## Acceptance checks

1. **Build:** `npm run build` passes, including TypeScript. ESLint is clean on every file this branch touched. A full `eslint src` shows 14 errors and 8 warnings, all in CRM, portal and login files this branch didn't touch (`src/app/login`, `src/app/portal/*`, `src/app/sign/[token]`, `src/components/crm/*`, `src/app/(crm)/clients/[id]`, `src/app/api/clients/*`).
2. **Raw HTML (production build, `next start`):** all 34 sitemap routes plus 4 draft routes have one H1, title, meta description, a canonical on `https://arkitech-sol.com`, valid JSON-LD, and at least 120 words of main text in the server HTML before any script runs. No `TODO` text appears in production HTML (owner notes render only in development).
3. **JSON-LD:** pricing, the AEO page, a town page and the sitewide organization are pasted at the end of this file, for Google's Rich Results Test and the Schema Markup Validator.
4. **Sitemap, robots, llms.txt:** as in task 5 above.
5. **Lighthouse mobile (local production build, this machine):**

   | Page | Performance | Accessibility | Best practices | SEO |
   |---|---|---|---|---|
   | `/` | 72 | 96 | 100 | 100 |
   | `/pricing` | 81 | 100 | 100 | 100 |
   | `/aeo-geo/seo-vs-aeo-vs-geo` (new template) | 76 | 100 | 100 | 100 |

   **Performance is under 90, but this branch didn't cause it.** `main` built and measured the same way scores 71 (home), 81 (pricing) and 80 (a blog post), and the live site (main, behind Vercel's CDN) scored 78 (home) and 88 (pricing) from the same machine. Layout shift is near zero everywhere; the slow paint is JavaScript work before the first text renders (framework chunks and the Google tag). Google's PageSpeed Insights runs on different hardware and may score differently, so check there before relying on the "90+ on mobile" promise. Making the site itself faster is separate work from this branch.
6. **Old wording:** `AI Receptionist` remains only in the internal CRM (`src/app/(crm)/receptionist/page.tsx`, `src/components/crm/app-shell.tsx`); `hello@` only in CRM demo data (`src/lib/demo-data.ts`); no `8am-5pm`; no `AI Search Optimization` as a product name.

## Changed files and new routes

69 files changed. The main ones:

- **Facts and offers:** `src/lib/marketing/site.ts`, `src/lib/pricing.ts` (plan defaults), `src/lib/marketing/offers.ts` (terms per plan), `src/lib/marketing/work.ts` (industry, town and case-study slug per client)
- **Schema:** `src/lib/marketing/seo.ts`
- **Route registry:** `src/lib/marketing/routes.ts`, used by `src/app/sitemap.ts` and `src/app/llms.txt`
- **FAQ data:** `src/lib/marketing/faq.ts`, used by /pricing, /faq and `/llms-full.txt`
- **Content (typed data):** `src/lib/content/*`
- **Templates:** `src/components/marketing/templates/*`
- **Owner notes (development only):** `src/components/marketing/site/owner-todo.tsx`
- **Redirects:** `next.config.ts`

**New indexable routes:**
- `/aeo-geo`, `/aeo-geo/does-a-small-business-need-aeo-geo`, `/aeo-geo/seo-vs-aeo-vs-geo`, `/aeo-geo/how-to-get-recommended-by-chatgpt`
- `/local-seo`, `/local-seo/google-business-profile-management`, `/local-seo/google-reviews`
- `/service-areas`, `/service-areas/burlington`, `/service-areas/south-burlington`, `/service-areas/winooski`, `/service-areas/essex`
- `/work/elite-real-estate-partners`, `/work/inspire-campaigns`, `/work/jeffs-seafood`, `/work/black-sheep-landscaping`, `/work/villageserver-initiative`, `/work/calljoe`
- `/llms-full.txt`

**Drafts (noindex, out of the sitemap, not linked from published pages):**
- `/industries/landscapers`, `/industries/cleaning-companies`, `/industries/real-estate`, `/industries/restaurants`, `/industries/contractors`, `/industries/nonprofits`
- `/compare/website-builder-vs-custom-website`, `/compare/monthly-website-plans-vermont`, `/compare/one-time-vs-monthly-website`
- `/guides/website-cost-vermont`
- `/aeo-geo/google-ai-overviews-local-business`, `/aeo-geo/200-pages-vs-thin-content`

The AEO page keeps its URL, `/services/ai-search`, now titled "AEO & GEO Website Build".

## Every TODO(owner)

In `src/lib/marketing/site.ts`, `src/lib/pricing.ts` and `src/lib/marketing/work.ts`:
- Confirm the public email; it may move to @arkitech-sol.com.
- Confirm the founding month (BBB: Jul 23, 2026).
- Confirm which founder name is public ("Terri Ambo" shown, "Teibiroa Ambo" as alternateName).
- Claim the LinkedIn company page, Bing Places, Yelp, Clutch and Apple Business Connect, then paste the URLs. `linkedin.com/company/arkitech-solutions` is a different company.
- Confirm the Overview and CRM dashboards are still in the Growth Partnership.
- Confirm whether the Custom Website's $150/month plan is optional or required (the site says optional).
- Define what "kept optimized" means for the AEO & GEO build, and for how long.
- Confirm blacksheepvt.com is live (503 DEPLOYMENT_PAUSED on Nov 4, 2026).
- Ask villageservers.org for a linked credit.

On the pricing page, FAQ and service pages:
- What happens if a Growth Partnership client leaves before 12 months, and at the end of the term.
- Who owns the site, domain and content under the Growth Partnership.
- Whether hosting is included in the Growth Partnership.
- Exactly what monthly Google Business Profile management includes.
- How the 30 review requests go out (text, email, timing), and confirmation that every customer is asked, since Google bans asking only happy customers.
- How long the AEO & GEO build takes.
- The mix of the 200 pages.

On the town pages:
- Burlington: a photo you took yourselves.
- Essex: a detail only a local would know; check the Five Corners and Expo wording.
- South Burlington: a client or connection; check the Dorset Street wording; which booking tools you connect.
- Winooski: a client or connection, and a photo.

On the case studies (all six):
- A sentence about each client in their own words.
- What each site includes.
- A measured PageSpeed score with date and report link (the page shows none until filled).
- A quote, only with written permission.
- CallJoe: confirm "eight estimates booked in October 2026" and that CallJoe is happy for it to be published.
- Jeff's Seafood: whether the site moves to its own domain.

On the drafts: every section is an owner note until written.

## Owner actions outside the code

- **Public address:** the site and schema now say 122 West St, Essex Junction, VT 05452. Make sure Google Business Profile and BBB show exactly the same.
- **Squarespace:** forward `sol-arkitech.com` and `www.sol-arkitech.com` with a 301 to `https://arkitech-sol.com`, without changing the MX records (email keeps working).
- **Vercel:** make the `www.arkitech-sol.com` to apex redirect permanent in the domain settings (it currently answers 307; the code redirect only applies when the app handles the request).
- **Search Console and Bing Webmaster Tools:** submit `https://arkitech-sol.com/sitemap.xml`.
- **PrimeMLS IDX vendor listing:** fix the wrong phone and `architechsolutionsvt@gmail.com`.
- **villageservers.org:** ask for a linked credit.
- **blacksheepvt.com:** confirm it's live again.
- **Directory profiles:** claim Bing Places, Apple Business Connect, Clutch, and a LinkedIn company page (`arkitech-solutions-vt` or similar).
- **CRM pricing settings:** the plan text on the live site comes from the pricing table in the CRM, with the code only as the default. If anyone has saved plans in CRM settings, the old names and features stay live until they're updated there (Settings → Pricing).

## Decisions made after the first pass (2026-11-11)

- **Public address:** 122 West St, Essex Junction, VT 05452, in the footer, contact blocks, About page, legal pages and the organization schema (`streetAddress` and `postalCode` added). The copy says the studio is in Essex Junction and serves Burlington and Chittenden County; Burlington stays the market the home page leads with.
- **Dashboards:** all six stay listed (Overview and CRM included with the monthly plans; Analytics, Finance, AI Assistant and Scheduling as add-ons), with no prices anywhere: pages, FAQ answers, llms.txt and schema. The add-ons have no Offer nodes. If the CRM pricing table still holds add-on prices, the site ignores them.

## Things that differ from earlier instructions

- **Town pages and Burlington-first positioning** follow this brief. You'd earlier asked to remove service areas and lead with remote work anywhere in the US.
- **Founder name:** "Terri Ambo" is shown, per your earlier instruction, with "Teibiroa Ambo" kept as the schema alternateName.

## JSON-LD samples

## Sitewide ProfessionalService (every page)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://arkitech-sol.com/#organization",
  "name": "ArkiTech Solutions",
  "legalName": "ArkiTech Solutions LLC",
  "alternateName": [
    "ArkiTech",
    "ArkiTech Solutions LLC"
  ],
  "url": "https://arkitech-sol.com",
  "logo": "https://arkitech-sol.com/icon.png",
  "image": "https://arkitech-sol.com/og.jpg",
  "description": "Burlington, Vermont web design studio: custom websites, Google Business Profile and review management, business dashboards, and AEO & GEO website builds.",
  "telephone": "+1-802-557-8828",
  "email": "studio@sol-arkitech.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Burlington",
    "addressRegion": "VT",
    "addressCountry": "US"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Burlington, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "South Burlington, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Winooski, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Essex, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Essex Junction, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Williston, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Colchester, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Shelburne, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "St. Albans, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "City",
      "name": "Stowe, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    {
      "@type": "State",
      "name": "Vermont"
    },
    {
      "@type": "Country",
      "name": "United States"
    }
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "08:00",
    "closes": "19:00"
  },
  "priceRange": "$150-$3,000",
  "founder": [
    {
      "@type": "Person",
      "@id": "https://arkitech-sol.com/about#ashish",
      "name": "Ashish Subedi",
      "jobTitle": "CEO & Fullstack Designer",
      "url": "https://arkitech-sol.com/about",
      "worksFor": {
        "@id": "https://arkitech-sol.com/#organization"
      },
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Champlain College"
      },
      "sameAs": [
        "https://www.linkedin.com/in/ashish-subedi2"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://arkitech-sol.com/about#terri",
      "name": "Terri Ambo",
      "alternateName": "Teibiroa Ambo",
      "jobTitle": "CEO & Director of Client Relations",
      "url": "https://arkitech-sol.com/about",
      "worksFor": {
        "@id": "https://arkitech-sol.com/#organization"
      }
    }
  ],
  "knowsAbout": [
    "Web design",
    "Answer engine optimization (AEO)",
    "Generative engine optimization (GEO)",
    "Local SEO",
    "Google Business Profile management",
    "Review management",
    "Business dashboards",
    "CRM"
  ],
  "sameAs": [
    "https://maps.google.com/?cid=16353977033327328632",
    "https://www.facebook.com/p/ArkiTech-Solutions-61591979698342/",
    "https://www.bbb.org/us/vt/essex-junction/profile/web-design/arkitech-solutions-0021-575880"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "ArkiTech Solutions plans",
    "itemListElement": [
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#growth-partnership",
        "name": "Growth Partnership",
        "description": "A 12-month partnership: we build your website, keep it fast, make your edits, and manage your Google Business Profile and reviews.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 300,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 300,
          "priceCurrency": "USD",
          "unitCode": "MON",
          "billingDuration": {
            "@type": "QuantitativeValue",
            "value": 12,
            "unitCode": "MON"
          }
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#custom-website",
        "name": "Custom Website",
        "description": "A custom website for a $1,000 build, with a $150/month plan you can cancel anytime. You don't have to host with us.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 1000,
        "priceCurrency": "USD",
        "priceSpecification": [
          {
            "@type": "PriceSpecification",
            "name": "Build",
            "price": 1000,
            "priceCurrency": "USD"
          },
          {
            "@type": "UnitPriceSpecification",
            "name": "Monthly plan",
            "price": 150,
            "priceCurrency": "USD",
            "unitCode": "MON"
          }
        ],
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#ai-search",
        "name": "AEO & GEO Website Build",
        "description": "200 unique, value-packed pages built to be found and cited by answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 3000,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "Build",
          "price": 3000,
          "priceCurrency": "USD"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      }
    ]
  }
}
```

## /pricing

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://arkitech-sol.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Pricing",
        "item": "https://arkitech-sol.com/pricing"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "ArkiTech Solutions plans and dashboard add-ons",
    "url": "https://arkitech-sol.com/pricing",
    "itemListElement": [
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#growth-partnership",
        "name": "Growth Partnership",
        "description": "A 12-month partnership: we build your website, keep it fast, make your edits, and manage your Google Business Profile and reviews.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 300,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 300,
          "priceCurrency": "USD",
          "unitCode": "MON",
          "billingDuration": {
            "@type": "QuantitativeValue",
            "value": 12,
            "unitCode": "MON"
          }
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#custom-website",
        "name": "Custom Website",
        "description": "A custom website for a $1,000 build, with a $150/month plan you can cancel anytime. You don't have to host with us.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 1000,
        "priceCurrency": "USD",
        "priceSpecification": [
          {
            "@type": "PriceSpecification",
            "name": "Build",
            "price": 1000,
            "priceCurrency": "USD"
          },
          {
            "@type": "UnitPriceSpecification",
            "name": "Monthly plan",
            "price": 150,
            "priceCurrency": "USD",
            "unitCode": "MON"
          }
        ],
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#ai-search",
        "name": "AEO & GEO Website Build",
        "description": "200 unique, value-packed pages built to be found and cited by answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 3000,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "Build",
          "price": 3000,
          "priceCurrency": "USD"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#dashboard-analytics",
        "name": "Analytics",
        "description": "Google Analytics, Meta and your other social accounts, connected in one view.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 50,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 50,
          "priceCurrency": "USD",
          "unitCode": "MON"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#dashboard-finance",
        "name": "Finance",
        "description": "Quote generation, and the money coming in and going out.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 50,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 50,
          "priceCurrency": "USD",
          "unitCode": "MON"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#dashboard-ai-assistant",
        "name": "AI Assistant",
        "description": "Reads all your centralized data and gives you clear answers about your business.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 50,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 50,
          "priceCurrency": "USD",
          "unitCode": "MON"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#dashboard-scheduling",
        "name": "Scheduling",
        "description": "Every calendar you use, synced into one.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 50,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 50,
          "priceCurrency": "USD",
          "unitCode": "MON"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which plan is right for my business?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you want a new website plus someone to run your Google Business Profile and ask customers for reviews, choose the Growth Partnership at $300/month for 12 months. If you only need a website and will handle Google yourself, choose the Custom Website: $1,000 to build, plus $150/month you can cancel anytime. If you want pages written to be found and cited by answer engines like ChatGPT, choose the $3,000 AEO & GEO Website Build."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Growth Partnership is a 12-month contract. The Custom Website's $150/month plan can be cancelled anytime. The AEO & GEO Website Build is a one-time $3,000 project, so there is nothing to cancel once it's delivered. Whichever plan you pick, the terms are agreed in writing before any work starts."
        }
      },
      {
        "@type": "Question",
        "name": "Do I own my website?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "With the Custom Website you don't have to host with us, so the site can live wherever you choose. After the AEO & GEO Website Build, you pick one of our hosting plans or own the site outright. Either way, you decide where the site lives."
        }
      },
      {
        "@type": "Question",
        "name": "Do I have to host with you?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The Custom Website has no requirement to host with us, so you can keep the site wherever suits you. After an AEO & GEO Website Build you can choose a hosting plan with us or take the site and own it outright."
        }
      },
      {
        "@type": "Question",
        "name": "Are there setup fees or hidden costs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Every price is on the pricing page. The only extras are dashboard add-ons (Analytics, Finance, AI Assistant, Scheduling) at $50/month each, and you choose whether to add them. Each plan's price is the whole price for what it lists."
        }
      },
      {
        "@type": "Question",
        "name": "What does the PageSpeed guarantee mean?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It means the site is fast for visitors on phones. We guarantee a 90+ mobile Performance score on Google PageSpeed Insights, measured on the live site with Google's own tool, and keep working on it free until it gets there. It's about the experience your visitors have, not a promise about Google rankings."
        }
      }
    ]
  }
]
```

## /services/ai-search

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AEO & GEO Website Build",
    "description": "An AEO (answer engine optimization) and GEO (generative engine optimization) build: 200 unique, value-packed pages, each answering a real question your customers ask, written so answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude can find and cite them. $3,000 one time.",
    "url": "https://arkitech-sol.com/services/ai-search",
    "provider": {
      "@id": "https://arkitech-sol.com/#organization"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Burlington, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "South Burlington, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Winooski, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Essex, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Essex Junction, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Williston, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Colchester, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Shelburne, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "St. Albans, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "City",
        "name": "Stowe, Vermont",
        "containedInPlace": {
          "@type": "State",
          "name": "Vermont"
        }
      },
      {
        "@type": "State",
        "name": "Vermont"
      },
      {
        "@type": "Country",
        "name": "United States"
      }
    ],
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#ai-search",
        "name": "AEO & GEO Website Build",
        "description": "200 unique, value-packed pages built to be found and cited by answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 3000,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "Build",
          "price": 3000,
          "priceCurrency": "USD"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://arkitech-sol.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Services",
        "item": "https://arkitech-sol.com/services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "AEO & GEO Website Build",
        "item": "https://arkitech-sol.com/services/ai-search"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Will this get my business recommended by ChatGPT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We can't promise that, and neither can anyone else: the AI tools decide what they show. The build gives answer engines 200 clear, specific pages about your business to find and cite, which is the part within anyone's control."
        }
      },
      {
        "@type": "Question",
        "name": "How is this different from a normal website?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A normal small business site has a handful of pages. This build is 200 unique pages, each answering one real question a customer asks, written answer-first so an answer engine can quote it and a person can act on it."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need the Growth Partnership as well?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The AEO & GEO Website Build is a one-time project on its own. Afterwards you can choose a hosting plan or own the site outright. The Growth Partnership is a separate plan for the website plus Google Business Profile and reviews."
        }
      }
    ]
  }
]
```

## /service-areas/essex

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Website design in Essex, Vermont",
    "description": "Custom websites, Google Business Profile management and AEO & GEO pages for Essex and Essex Junction, Vermont businesses, from a studio in nearby Burlington.",
    "url": "https://arkitech-sol.com/service-areas/essex",
    "provider": {
      "@id": "https://arkitech-sol.com/#organization"
    },
    "areaServed": {
      "@type": "City",
      "name": "Essex, Vermont",
      "containedInPlace": {
        "@type": "State",
        "name": "Vermont"
      }
    },
    "offers": [
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#growth-partnership",
        "name": "Growth Partnership",
        "description": "A 12-month partnership: we build your website, keep it fast, make your edits, and manage your Google Business Profile and reviews.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 300,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "name": "Monthly",
          "price": 300,
          "priceCurrency": "USD",
          "unitCode": "MON",
          "billingDuration": {
            "@type": "QuantitativeValue",
            "value": 12,
            "unitCode": "MON"
          }
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#custom-website",
        "name": "Custom Website",
        "description": "A custom website for a $1,000 build, with a $150/month plan you can cancel anytime. You don't have to host with us.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 1000,
        "priceCurrency": "USD",
        "priceSpecification": [
          {
            "@type": "PriceSpecification",
            "name": "Build",
            "price": 1000,
            "priceCurrency": "USD"
          },
          {
            "@type": "UnitPriceSpecification",
            "name": "Monthly plan",
            "price": 150,
            "priceCurrency": "USD",
            "unitCode": "MON"
          }
        ],
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      },
      {
        "@type": "Offer",
        "@id": "https://arkitech-sol.com/pricing#ai-search",
        "name": "AEO & GEO Website Build",
        "description": "200 unique, value-packed pages built to be found and cited by answer engines like ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.",
        "url": "https://arkitech-sol.com/pricing",
        "price": 3000,
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "name": "Build",
          "price": 3000,
          "priceCurrency": "USD"
        },
        "seller": {
          "@id": "https://arkitech-sol.com/#organization"
        }
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://arkitech-sol.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Service areas",
        "item": "https://arkitech-sol.com/service-areas"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Essex",
        "item": "https://arkitech-sol.com/service-areas/essex"
      }
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do you work with businesses in Essex Junction?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Essex and Essex Junction are part of our main service area, along with Burlington, South Burlington, Winooski, Williston and the rest of Chittenden County. We also work remotely with businesses anywhere in the US."
        }
      },
      {
        "@type": "Question",
        "name": "How long does a website take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Two to four weeks for a standard site, from the first call to launch. The variable is usually how quickly we get your photos, your service list and your feedback on the first draft."
        }
      }
    ]
  }
]
```

