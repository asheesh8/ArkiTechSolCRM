"use client";

import { useState } from "react";
import { Archive, Ban, ExternalLink, Gauge, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

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
      category: formData.get("category"),
      maxReviewCount: formData.get("maxReviewCount") || undefined,
      minimumRating: formData.get("minimumRating") || undefined,
      onlyNoWebsite: formData.get("onlyNoWebsite") === "on",
      onlyWeakWebsite: formData.get("onlyWeakWebsite") === "on",
    };
    const res = await fetch("/api/leads/search", { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMessage(data.error ?? "Search failed");
    setLeads(data.leads ?? []);
    window.dispatchEvent(new Event("locallead:scrape-usage"));
    setMessage(data.warning ?? `${data.leads?.length ?? 0} leads found`);
  }

  async function saveLead(lead: any) {
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
        <p className="mt-1 text-sm text-zinc-500">Uses the official Google Places API. No unauthorized scraping.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Find Local Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={search} className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-2 md:col-span-2 xl:col-span-2">
              <Label>Town, state, ZIP</Label>
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
            <div className="grid grid-cols-[1fr_88px] gap-3 xl:col-span-2">
              <div className="space-y-2"><Label>Auto-filled city</Label><Input name="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Optional" /></div>
              <div className="space-y-2"><Label>State</Label><Input name="state" value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="NC" /></div>
            </div>
            <input type="hidden" name="zip" value={zip} />
            <div className="space-y-2"><Label>Industry</Label><Input name="category" defaultValue="dentist" required /></div>
            <div className="space-y-2"><Label>Max reviews</Label><Input name="maxReviewCount" type="number" placeholder="50" /></div>
            <div className="space-y-2"><Label>Min rating</Label><Input name="minimumRating" type="number" step="0.1" placeholder="4.0" /></div>
            <div className="flex items-end"><Button disabled={loading} className="w-full">{loading ? "Searching..." : "Search"}</Button></div>
            <label className="flex items-center gap-2 text-sm"><input name="onlyNoWebsite" type="checkbox" /> Only no website</label>
            <label className="flex items-center gap-2 text-sm"><input name="onlyWeakWebsite" type="checkbox" /> Only weak website</label>
          </form>
          {message ? <p className="mt-4 text-sm text-zinc-500">{message}</p> : null}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)
        ) : leads.length ? (
          leads.map((lead) => (
            <Card key={lead.googlePlaceId ?? lead.businessName}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{lead.businessName}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{lead.category ?? "Local Business"} · {lead.address}</p>
                    <p className="mt-3 text-sm">Rating {lead.googleRating ?? "--"} · {lead.googleReviewCount ?? 0} reviews</p>
                    <p className="mt-1 text-sm">{lead.phone ?? "No phone listed"}</p>
                  </div>
                  <div className="text-right text-sm">{lead.website ? <a className="hover:underline" href={lead.website} target="_blank">Website</a> : <span className="text-amber-600">No website</span>}</div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => runPageSpeed(lead)}><Gauge className="h-4 w-4" /> Run PageSpeed</Button>
                  <Button onClick={() => saveLead(lead)}><Save className="h-4 w-4" /> Save to CRM</Button>
                  {lead.googleMapsUrl ? <a href={lead.googleMapsUrl} target="_blank"><Button variant="secondary"><ExternalLink className="h-4 w-4" /> Maps</Button></a> : null}
                  <Button variant="outline" onClick={() => hideLead(lead, "ARCHIVED")}><Archive className="h-4 w-4" /> Archive</Button>
                  <Button variant="danger" onClick={() => hideLead(lead, "DECLINED")}><Ban className="h-4 w-4" /> Decline</Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 xl:col-span-2">
            Enter a location and industry to populate lead cards.
          </div>
        )}
      </section>
    </div>
  );
}
