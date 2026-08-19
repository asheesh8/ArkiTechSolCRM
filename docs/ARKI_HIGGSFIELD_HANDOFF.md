# Arki × Higgsfield — handoff

Everything needed to generate the mascot assets in an environment that can actually reach
Higgsfield, and wire them back into this repo.

---

## 1. State of play

All on `main`, pushed:

| Commit | What |
|---|---|
| `721eb7e` | Arki v1 — peek-over-the-button mascot |
| `b068c63` | Nav dropdowns, `/services` + `/blog` pages, Arki moods, seasons |
| `25f95ca` | Arki redrawn chubby |

Live now:

- **`src/components/mascot/arki-mascot.tsx`** — `Head`, `Hands`, `Eyes`, `Palette`, `SeasonKit`
- **`src/components/mascot/arki-companion.tsx`** — full-body Arki, moods: `idle` `wave` `point` `sleep` `celebrate`
- **`src/components/mascot/peek-button.tsx`** — the peek-over-the-rim button
- **`src/lib/season.ts`** — one switch for seasonal dress (autumn is live now)
- **`/mascot-lab`** — scratch page to view him in isolation, not linked from the site

Build passes, typecheck and lint clean, no console errors, no horizontal overflow at
1440 / 1280 / 390.

---

## 2. Why Higgsfield didn't happen in the cloud session

Not a "didn't try" — it's blocked at the network layer:

| Check | Result |
|---|---|
| Higgsfield API key in project or env | none anywhere |
| `higgsfield.ai:443` | `403` to CONNECT — gateway policy denial |
| `api.higgsfield.ai:443` | same |
| `www.eskerdesigns.com:443` | same (this is why I couldn't load the reference site either) |

Everything outbound in a Claude Code web session tunnels through an egress proxy whose
allowlist is set by the environment's network policy. A headless browser hits the same
wall — it's the same process making the same blocked request.

**To unblock, either:**

1. **Run locally.** Clone, `pnpm install`, and work in Claude Code on your own machine —
   no egress proxy, so Higgsfield is directly reachable.
2. **Widen the cloud environment's network policy** to allowlist `higgsfield.ai` and
   `api.higgsfield.ai`, then set `HIGGSFIELD_API_KEY`.
   See <https://code.claude.com/docs/en/claude-code-on-the-web>.

Option 1 is faster and you'll want the Higgsfield UI open anyway for curation.

---

## 3. What Higgsfield should and should not make

This is the call that decides whether the site reads as crafted or as AI slop.

### Keep as vector + GSAP — do NOT generate

**The mascot in the UI.** Arki peeking over buttons, waving on service pages, asleep in
the footer. That needs:

- true transparency against any background
- crisp edges at every size and DPR
- reaction to hover, focus, and click
- a few KB, not a few MB
- pixel-identical output on every single load

Generated video gives you none of those. Mushy alpha, a face that drifts every render,
~2MB per loop, zero interactivity. That is precisely the look you said to avoid, and it's
a medium problem — no amount of prompt tuning fixes it.

### Generate in Higgsfield — this is where it wins

| Asset | Format | Where it goes |
|---|---|---|
| Hero background loop | mp4, 1920×1080, 8–12s seamless | replaces//augments `public/hero-bg.mp4` (scroll-scrubbed by `hero.tsx`) |
| Seasonal ambient plates | mp4 or webp, same framing | `public/seasons/autumn.mp4`, `winter.mp4` |
| Arki hero portrait | png, transparent or dark bg, 2048px | About/team section, OG image |
| Social + ad cuts | mp4 9:16 and 1:1 | outside the repo — for paid and organic |

Note the portrait: a **still** 3D render of Arki is a great use of generation. It needs no
transparency animation, no interactivity, and no frame-to-frame consistency. That's the
one place a chubby rendered Arki genuinely beats the vector.

---

## 4. The key trick — seed the character from the vector

The usual failure with AI mascots is drift: every generation is a slightly different
character. Higgsfield's Soul ID / character reference fixes that, but it wants 20–50
reference images, and you don't have any.

**You do, though — you have a deterministic vector Arki.** Bootstrap the reference set
from him:

1. **Export the canonical front view.** Run the dev server and screenshot the SVG at high
   DPR. `/mascot-lab` and the mood pages render him at `deviceScaleFactor: 3`. Export each
   mood — idle, wave, point, sleep, celebrate — plus both seasonal variants. That's your
   on-model ground truth.
2. **img2img the missing angles.** Feed the front view into Higgsfield and ask for 3/4
   left, 3/4 right, profile, back, top-down, and a few lighting variations.
3. **Curate ruthlessly.** Keep only frames that hold the proportions in §5. Reject
   anything with the wrong head-to-body ratio, small eyes, or extra detail. This step is
   the entire quality control — a bad frame in the reference set poisons everything after.
4. **Build the Soul ID** from the curated set (aim for 20+).
5. **Generate everything else** against that identity.

The vector character is the spec. Generation reproduces it; it doesn't invent it.

---

## 5. Character spec

Give this to Higgsfield verbatim, and check every output against it.

### Proportions — the cuteness levers

Values in the SVG's user units. Ratios are what matter.

| Part | Size | Note |
|---|---|---|
| Head | 108 w × 82 h, `rx 41` | **wider and taller than the torso** |
| Torso | 92 w × 68 h, `rx 33` | squat, narrower than the head |
| Visor | 84 w × 52 h, `rx 26` | takes up most of the face |
| Eyes | `rx 12.5`, `ry 13.5`, centres 32 apart, `cy 62` | large, low, wide apart |
| Arms | 19 w × 30 h stubs | no elbows, no forearms |
| Hands | r 13 mitts | no fingers except on the peek pose |
| Feet | ellipse `rx 18`, `ry 10.5` | little ovals he balances on |
| Neck | none | head overlaps the torso directly |

If the head looks too big, it's right.

### Palette — exact

```
Shell gradient   #ffffff → #f0f1fa → #cfd2e6
Shell outline    #b3b7d0
Visor gradient   #2a2154 → #150f2e
Eye gradient     #d8fbff → #5ee7f5 → #18b6d8
Antenna ball     #8b5cf6   highlight #ddd6fe
Limbs / ear caps #c6c9dd
Hands            #eceefa   fingertips #f7f8fd
Blush            #f0abfc @ 40%
Autumn leaf      #f97316   stem #c2410c
Winter hat       #8b5cf6 + #ede9fe
Site background  #0c0c18   footer #08080f
```

### Do

- Soft studio light, gentle rim light, matte ceramic finish
- One clean highlight per eye plus a small secondary catchlight
- Rounded everything, generous fillets on every edge
- Reads at 32px as clearly as at 2048px

### Do not

- No mouth. His face is two eyes on a dark visor — that's the whole design
- No fingers, no elbows, no knees, no neck
- No panel lines, rivets, seams, screws, or greebles
- No glowing chest arc reactor, no exposed wiring, no antennae plural
- Not glossy chrome, not metallic, not weathered, not battle-worn
- No human proportions — he is not a small person in a robot suit
- Nothing resembling any existing mascot. He is our character

---

## 6. Prompt kit

**Base identity** (prepend to everything):

> A small chubby friendly robot character. Oversized near-spherical white ceramic head,
> much wider and taller than its squat rounded body. Large glowing cyan oval eyes set low
> and far apart on a dark navy visor face. No mouth. Short stubby arms ending in round
> mitten hands, no fingers. Small oval feet. Short antenna with a violet ball on top. Soft
> matte finish, gentle studio lighting, soft violet rim light. Clean minimal design, no
> panel lines or mechanical detail. Cute, warm, approachable.

**Hero background loop:**

> …slow drifting abstract dark environment, deep navy #0c0c18, soft violet and cyan light
> blooms, gentle particle drift, no characters, no text, seamless loop, subtle and
> unobtrusive enough to sit behind white headline type.

**Autumn plate:**

> …the same environment with warm amber and orange light, a few maple leaves drifting
> slowly through frame, still deep navy overall, seamless loop.

**Arki hero portrait:**

> …three-quarter view, standing, waving one arm, happy curved-arc eyes, on a transparent
> background, product-render quality, 2048px, soft studio key light with violet rim.

---

## 7. Wiring generated assets back in

**Hero loop** — `src/components/landing/hero.tsx` already scroll-scrubs
`public/hero-bg.mp4` via ScrollTrigger. Drop the new file in and it just works. Keep it
under ~4MB; it loads eagerly.

**Seasonal plates** — `src/lib/season.ts` is already the single switch. Extend it to
return an asset path alongside the season, and read that in the hero:

```ts
export function currentSeasonAssets(date = new Date()) {
  const season = currentSeason(date);
  return { season, plate: season === "none" ? null : `/seasons/${season}.mp4` };
}
```

**Arki portrait** — drop at `public/arki/portrait.png`, use with `next/image` in the team
or about section. Give it explicit width/height so it doesn't shift layout.

**Do not** replace the vector components with generated frames. See §3.

---

## 8. Guardrails

- **No fabricated proof.** No invented testimonials, client names, or performance numbers
  anywhere. The service copy in `src/lib/services-content.ts` deliberately makes no
  performance claims — keep it that way until there are real results to cite.
- **Keep the character ours.** Duolingo-level craft, not Duolingo's owl or art style.
- **Don't break the back door.** `src/components/landing/footer-logo.tsx` opens
  `/dashboard` on a triple click. It's how the team reaches the CRM from the public site.
- **`prefers-reduced-motion`** is honoured throughout. Any generated video that autoplays
  needs the same respect.
- **Pre-existing lint** elsewhere in `src` (15 errors, 8 warnings) is untouched and not
  from this work.

---

## 9. Checklist

- [ ] Clone locally, `pnpm install`, `pnpm dev`
- [ ] Export canonical Arki frames from `/mascot-lab` and the mood pages at 3× DPR
- [ ] img2img the missing angles in Higgsfield, curate hard against §5
- [ ] Build the Soul ID from 20+ curated frames
- [ ] Generate: hero loop, autumn plate, winter plate, hero portrait
- [ ] Drop assets into `public/`, extend `season.ts`
- [ ] Check hero loop weight and that reduced-motion still behaves
- [ ] Verify at 1440 / 1280 / 390

---

## 10. Open decisions

- **Winter needs a look.** Autumn is done (maple leaf on his head). Winter currently swaps
  the antenna for a bobble hat — fine, but unreviewed.
- **Service Areas pages.** The competitor ranks on one page per town
  (`/richmond/...`, `/stowe/...`). Same template as `/services/[slug]`, different axis.
  Worth doing, not started.
- **Free tool as a lead magnet.** They run a "Free Copy Generator". You have a CRM,
  PageSpeed checks, and review tooling already — a free site-speed or review-gap checker
  would be a stronger magnet than a copy generator.
