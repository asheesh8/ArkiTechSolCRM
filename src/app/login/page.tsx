import Image from "next/image";
import { Lockup } from "@/components/ui/brand";
import { LoginForm } from "./login-form";
import { ART } from "@/lib/art";

export const metadata = { title: "Sign in" };

/**
 * Sign in. Artwork on the left on desktop, a short band on phones; the form
 * is one small card. The light loop plays over the still when motion is
 * allowed and the connection is good; otherwise the still stays.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; sent?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="relative h-[28vh] shrink-0 overflow-hidden art-fallback md:h-auto md:w-[55%]">
        <Image src={ART.hero34} alt="" fill priority unoptimized sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        <video className="absolute inset-0 hidden size-full object-cover motion-safe:md:block" autoPlay muted loop playsInline poster={ART.hero169} aria-hidden>
          <source src={ART.heroLoop} type="video/mp4" />
        </video>
        <div className="absolute inset-x-0 bottom-0 hidden p-8 text-text md:block">
          <p className="max-w-sm font-serif text-xl leading-snug">Your business, run with you by ArkiTech.</p>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Lockup className="mb-8" />
          <h1 className="font-serif text-2xl">Sign in</h1>
          <p className="mb-6 mt-1 text-sm text-text-muted">We'll email you a link, or use your password.</p>
          <LoginForm next={sp.next} error={sp.error} sent={sp.sent === "1"} />
        </div>
      </main>
    </div>
  );
}
