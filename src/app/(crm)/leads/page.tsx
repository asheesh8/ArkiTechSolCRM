"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Ban, Building2, ExternalLink, Gauge, Globe2, MapPin, Save, Search, Star, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";

const stateNames: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
};

export default function LeadsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [category, setCategory] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState("all");

  function parseLocation(value: string) {
    setLocation(value);
    const zipMatch = value.match(/\b\d{5}(?:-\d{4})?\b/);
    const withoutZip = value.replace(/\b\d{5}(?:-\d{4})?\b/, "").trim();
    const lower = withoutZip.toLowerCase().replace(/,+$/, "").trim();
    const fullState = Object.entries(stateNames)
      .sort(([a], [b]) => b.length - a.length)
      .find(([name]) => lower.endsWith(name));
    const stateMatch = withoutZip.match(/(?:,|\s)\s*([A-Za-z]{2})\s*$/);
    const nextState = fullState?.[1] ?? stateMatch?.[1]?.toUpperCase() ?? "";
    const nextCity = withoutZip
      .replace(new RegExp(`(?:,|\\s)\\s*${fullState?.[0] ?? ""}\\s*$`, "i"), "")
      .replace(/(?:,|\s)\s*[A-Za-z]{2}\s*$/, "")
      .replace(/,+$/, "")
      .trim();

    setCity(nextCity);
    setState(nextState);
    setZip(zipMatch?.[0] ?? "");
  }

  async function search(formData: FormData) {
    setLoading(true);
    setMessage("");
    const locationValue = String(formData.get("location") ?? "").trim();
    if (!locationValue) {
      setLoading(false);
      setLeads([]);
      setMessage("Type a town, state, ZIP, or area before searching.");
      return;
    }
    const payload = {
      location: locationValue,
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      category: String(formData.get("category") ?? "").trim() || undefined,
      maxReviewCount: formData.get("maxReviewCount") || undefined,
      minimumRating: formData.get("minimumRating") || undefined,
      onlyNoWebsite: websiteFilter === "noWebsite",
      onlyWeakWebsite: websiteFilter === "weakWebsite",
    };
    const res = await fetch("/api/leads/search", { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.error ?? "Search failed");
    setLeads(data.leads ?? []);
    window.dispatchEvent(new Event("locallead:scrape-usage"));
    setMessage(data.warning ?? `${data.leads?.length ?? 0} leads found`);
  }

  async function saveLead(lead: any, openProfile = false) {
    const category = lead.category?.includes("Saved from scraper")
      ? lead.category
      : `${lead.category ?? "Local Business"} · Saved from scraper`;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        category,
        notes: "Saved from scraper",
        status: "SAVED",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return setMessage(data.error ?? "Could not save lead");
    }
    setLeads((current) => current.filter((item) => item.googlePlaceId !== lead.googlePlaceId));
    setMessage(`${lead.businessName} saved to CRM from scraper`);
    if (openProfile && data.lead?.id) {
      router.push(`/clients/${data.lead.id}`);
    }
  }

  async function runPageSpeed(lead: any) {
    if (!lead.website) return setMessage("This lead has no website to audit.");
    setMessage("Running PageSpeed audit...");
    const res = await fetch("/api/pagespeed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: lead.website, strategy: "mobile" }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Performance score: ${data.audit.performance ?? "--"}` : data.error ?? "Audit failed");
  }

  async function hideLead(lead: any, reason: "ARCHIVED" | "DECLINED") {
    if (!lead.googlePlaceId) {
      setLeads((current) => current.filter((item) => item !== lead));
      setMessage(`${lead.businessName} hidden for this search.`);
      return;
    }

    const res = await fetch("/api/leads/exclusions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        googlePlaceId: lead.googlePlaceId,
        businessName: lead.businessName,
        reason,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      return setMessage(data.error ?? "Could not hide this business");
    }

    setLeads((current) => current.filter((item) => item.googlePlaceId !== lead.googlePlaceId));
    setMessage(
      reason === "ARCHIVED"
        ? `${lead.businessName} archived and will not appear in search again.`
        : `${lead.businessName} declined and will not appear in search again.`,
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Leads/Scraper</h2>
        <p className="mt-1 text-sm text-zinc-500">Google Business Profile search using the official Places API. No unauthorized scraping.</p>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Find Local Businesses</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">Target good-fit businesses by market, reviews, rating, and website opportunity.</p>
            </div>
            <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              Official Google Places results
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={search} className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
              <div className="space-y-2">
                <Label>Market</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    name="location"
                    list="location-suggestions"
                    value={location}
                    onChange={(event) => parseLocation(event.target.value)}
                    className="pl-9"
                    placeholder="Try 90210, Miami FL, Brooklyn NY, or Greenville SC"
                    required
                  />
                </div>
                <datalist id="location-suggestions">
                  <option value="90210" />
                  <option value="Miami FL" />
                  <option value="Brooklyn NY" />
                  <option value="Chicago IL 60601" />
                  <option value="Austin Texas" />
                  <option value="Seattle WA" />
                </datalist>
                <p className="text-xs text-zinc-500">Search any US city, full state name, abbreviation, ZIP code, or area.</p>
              </div>
              <div className="grid grid-cols-[1fr_92px] gap-3">
                <div className="space-y-2">
                  <Label>Auto-filled city</Label>
                  <Input name="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input name="state" value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="NC" />
                </div>
              </div>
            </div>
            <input type="hidden" name="zip" value={zip} />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 xl:col-span-2">
                <Label>Industry</Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    name="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="pl-9"
                    placeholder="Optional, e.g. dentist, med spa, roofing"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["dentist", "med spa", "roofing", "restaurant", "law firm"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website opportunity</Label>
                <Select value={websiteFilter} onChange={(event) => setWebsiteFilter(event.target.value)}>
                  <option value="all">All businesses</option>
                  <option value="noWebsite">No website listed</option>
                  <option value="weakWebsite">Weak/missing website</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reviews</Label>
                <Select name="maxReviewCount" defaultValue="">
                  <option value="">Any review count</option>
                  <option value="10">10 or fewer</option>
                  <option value="25">25 or fewer</option>
                  <option value="50">50 or fewer</option>
                  <option value="100">100 or fewer</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label>Minimum rating</Label>
                <Select name="minimumRating" defaultValue="">
                  <option value="">Any rating</option>
                  <option value="4.8">4.8+</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </Select>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">Best target</p>
                <p className="mt-1 text-xs">Low reviews + high rating + no website usually means an easier website pitch.</p>
              </div>
              <Button disabled={loading} className="w-full md:w-auto">
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Search Google"}
              </Button>
            </div>
          </form>
          {message ? <p className="mt-4 text-sm text-zinc-500">{message}</p> : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)
        ) : leads.length ? (
          leads.map((lead) => (
            <Card key={lead.googlePlaceId ?? lead.businessName}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{lead.businessName}</h3>
                      {!lead.website ? <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900">No website</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{lead.category ?? "Local Business"}</p>
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{lead.address ?? "No address listed"}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <div className="flex items-center justify-end gap-1 font-semibold text-zinc-900 dark:text-zinc-100">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {lead.googleRating ?? "--"}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{lead.googleReviewCount ?? 0} reviews</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500"><UsersRound className="h-3.5 w-3.5" /> Phone</div>
                    <p className="mt-1 truncate text-sm">{lead.phone ?? "No phone listed"}</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500"><Globe2 className="h-3.5 w-3.5" /> Website</div>
                    <p className="mt-1 truncate text-sm">{lead.website ? "Listed" : "Missing"}</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500"><MapPin className="h-3.5 w-3.5" /> Market</div>
                    <p className="mt-1 truncate text-sm">{[lead.city, lead.state].filter(Boolean).join(", ") || "Unknown"}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => runPageSpeed(lead)}><Gauge className="h-4 w-4" /> Run PageSpeed</Button>
                  <Button onClick={() => saveLead(lead, true)}><Save className="h-4 w-4" /> Save & open CRM</Button>
                  <Button variant="secondary" onClick={() => saveLead(lead)}><Save className="h-4 w-4" /> Save only</Button>
                  {lead.googleMapsUrl ? <a href={lead.googleMapsUrl} target="_blank"><Button variant="secondary"><ExternalLink className="h-4 w-4" /> Maps</Button></a> : null}
                  <Button variant="outline" onClick={() => hideLead(lead, "ARCHIVED")}><Archive className="h-4 w-4" /> Archive</Button>
                  <Button variant="danger" onClick={() => hideLead(lead, "DECLINED")}><Ban className="h-4 w-4" /> Decline</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 xl:col-span-2">
            Enter a location to populate lead cards. Industry is optional.
          </div>
        )}
      </section>
    </div>
  );
}
