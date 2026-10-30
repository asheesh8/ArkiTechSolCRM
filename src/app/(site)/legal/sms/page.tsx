import { Bullet, Bullets, Callout, ContactBlock, DocHeader, InlineLink, P, StudioEmail, Section, Subhead } from "@/components/marketing/legal/prose";
import { pageMetadata } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";
import { SMS_CONSENT, SMS_ENROLLMENT, SMS_KEYWORD_REPLIES, SMS_PROGRAM, SMS_SENDER } from "@/lib/sms-program";

export const metadata = pageMetadata({
  title: "SMS Terms | ArkiTech Solutions",
  description:
    "The ArkiTech Solutions SMS program: Command Center internal notifications for team members who opt in. Consent, frequency, STOP and HELP replies, and privacy.",
  path: "/legal/sms",
});

// The page an A2P 10DLC reviewer is sent to.
//
// It describes the one program actually registered, Command Center internal
// notifications, in the same words as the campaign: who sends, who receives,
// how they opt in, what they get, how often, the exact keyword replies, and
// that opt-in data is never sold or shared. Every program string comes from
// src/lib/sms-program.ts so this page and the Privacy Policy can't drift.

const strong = "font-semibold text-[var(--fg)]";

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="mt-4 border-l-2 border-[var(--accent)] bg-[var(--bg-2)] px-5 py-4 text-[0.98rem] leading-relaxed text-[var(--fg)]">
      {children}
    </blockquote>
  );
}

export default function SmsTermsPage() {
  return (
    <article>
      <DocHeader title="SMS Terms" updated="October 30, 2026" active="sms" />

      <P>
        These SMS Terms describe the text message program run by {SMS_SENDER}{" "}(&ldquo;ArkiTech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;): <strong className={strong}>{SMS_PROGRAM}</strong>. They explain who receives these messages, how to opt in, what the
        messages contain, how often they are sent, and how to stop them. They supplement our{" "}
        <InlineLink href="/legal/privacy">Privacy Policy</InlineLink> and <InlineLink href="/legal/terms">Terms of Service</InlineLink>.
      </P>

      <Section id="program" title="1. The Program">
        <Bullets>
          <Bullet>
            <strong className={strong}>Sender:</strong> {SMS_SENDER}.
          </Bullet>
          <Bullet>
            <strong className={strong}>Program:</strong> {SMS_PROGRAM}, sent through Command Center, ArkiTech&rsquo;s internal workspace.
          </Bullet>
          <Bullet>
            <strong className={strong}>Who receives messages:</strong> ArkiTech team members who opt in. Customers, prospects, and website visitors are not
            enrolled in this program.
          </Bullet>
          <Bullet>
            <strong className={strong}>Message types:</strong> internal new-lead notifications, company announcements, and system alerts. The program
            sends no marketing or promotional messages.
          </Bullet>
        </Bullets>
      </Section>

      <Section id="consent" title="2. How to Opt In">
        <P>
          Enrollment is optional and is not required to use Command Center. A team member opts in by entering a mobile number under Settings &rarr; Text
          notifications in Command Center and checking a box next to this statement:
        </P>
        <Quote>{SMS_CONSENT}</Quote>
        <P>
          The checkbox is unchecked by default. We record each opt-in and opt-out with the wording shown, the time, the account, and the number. Right
          after opting in, the team member receives this confirmation message:
        </P>
        <Quote>{SMS_ENROLLMENT}</Quote>
      </Section>

      <Section id="frequency" title="3. Message Frequency and Rates">
        <P>
          New-lead notification frequency varies as leads arrive. Company announcements and system alerts together total no more than{" "}
          <strong className={strong}>3 messages per week</strong>.
        </P>
        <P>
          Message and data rates may apply according to your mobile carrier&rsquo;s plan. ArkiTech does not charge for text messages. Carriers are not
          liable for delayed or undelivered messages, and delivery depends on your carrier and device.
        </P>
      </Section>

      <Section id="keywords" title="4. Opt-Out, Help, and Opt-In Keywords">
        <P>
          You can stop messages at any time by replying <strong className={strong}>STOP</strong> to any message, or by unchecking Text notifications in
          Command Center. Each keyword below gets exactly one automatic reply, word for word as shown. After STOP, we send no further messages to that
          number unless you reply START or opt in again.
        </P>
        <div className="mt-6 grid gap-5">
          {SMS_KEYWORD_REPLIES.map((k) => (
            <div key={k.keywords}>
              <Subhead>Reply {k.keywords}</Subhead>
              <Quote>{k.reply}</Quote>
            </div>
          ))}
        </div>
      </Section>

      <Section id="privacy" title="5. Privacy">
        <Callout>
          We do not sell, rent, or share mobile numbers or SMS opt-in data. No mobile information will be shared with third parties or affiliates for
          marketing or promotional purposes. Text messaging originator opt-in data and consent are not shared with any third parties.
        </Callout>
        <P>
          Mobile numbers enrolled in this program are used only to send the messages described in these SMS Terms. The only party that receives them is
          our messaging provider, Twilio, solely to deliver the messages. Our <InlineLink href="/legal/privacy">Privacy Policy</InlineLink> describes in
          full what we collect, how long we keep it, and the choices you have.
        </P>
      </Section>

      <Section id="customers" title="6. Customers and Website Visitors">
        <P>
          This program does not send automated or marketing texts to customers, prospects, or website visitors. If you give us your number on our website
          and agree to be contacted, a member of our team may call or text you personally about your request. You can ask us to stop at any time by
          replying STOP or by contacting us below, and we will not text you again.
        </P>
      </Section>

      <Section id="contact" title="7. Support and Contact">
        <P>
          For help with messages you have received, reply <strong className={strong}>HELP</strong> to any message, call{" "}
          <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">
            {SITE.phone}
          </a>
          , or email <StudioEmail />.
        </P>
        <Subhead>Contact</Subhead>
        <ContactBlock />
      </Section>
    </article>
  );
}
