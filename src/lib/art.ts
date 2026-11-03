/**
 * Artwork generated with Higgsfield (concrete and sunlight direction).
 * `scripts/fetch-art.mjs` copies these into public/art for self-hosting;
 * until then the CDN URLs work directly. Keys stay the same either way.
 */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3JiG1MNgXlwJ2S8Ksxzq2LKBeol/";
const LOCAL = process.env.NEXT_PUBLIC_ART_LOCAL === "1";
const pick = (file: string, local: string) => (LOCAL ? `/art/${local}` : CDN + file);

export const ART = {
  hero169: pick("hf_20261103_014322_71f59d63-9f67-4499-9d5d-0ff30b764fd4.png", "hero-16x9.png"),
  hero219: pick("hf_20261103_014323_4f3d4244-4047-4b75-9c15-5ee9675e1019.png", "hero-21x9.png"),
  hero34: pick("hf_20261103_014323_8917cefa-3a55-47e4-a067-bc8b091783fb.png", "hero-3x4.png"),
  heroLoop: pick("hf_20261103_014406_79894790-0808-4e1a-8d8c-f9ffaace21fa.mp4", "hero-loop.mp4"),
  onboarding: {
    welcome: pick("hf_20261103_014323_c174d203-26b6-4a6f-9799-7a64b75214e3.png", "onboarding-welcome.png"),
    details: pick("hf_20261103_014322_29b2795b-8afe-43bc-8999-fa08dba52039.png", "onboarding-details.png"),
    documents: pick("hf_20261103_014323_f7221881-ed8b-4da9-811d-4861bcc68cd7.png", "onboarding-documents.png"),
    done: pick("hf_20261103_014324_6c0a3bd1-6222-4b49-9112-885ed252ba2d.png", "onboarding-done.png"),
  },
} as const;
