import { Bullet, Bullets, Callout, ContactBlock, DocHeader, InlineLink, P, StudioEmail, Section, Subhead } from "@/components/marketing/legal/prose";
import { pageMetadata } from "@/lib/marketing/seo";

export const metadata = pageMetadata({
  title: "SMS Terms | ArkiTech Solutions",
  description:
    "How ArkiTech Solutions uses text messaging: what you consent to, how to opt out, message frequency, and carrier rates.",
  path: "/legal/sms",
});

// The page an A2P 10DLC reviewer is sent to.
//
// Carriers check that four things are stated plainly and in one place: what a
// person agreed to, how to stop, how often messages come, and that rates may
// apply. Splitting them across a general privacy policy is a common reason a
// campaign is rejected, so they live here together.

export default function SmsTermsPage() {
  return (
    <article>
      <DocHeader title="SMS Terms" updated="October 14, 2026" active="sms" />

      <P>
        These SMS Terms explain how ArkiTech Solutions LLC, operating as ArkiTech Solutions (&ldquo;ArkiTech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo;
        or &ldquo;our&rdquo;), uses text messaging, what you agree to when you give us your mobile number, and how to stop messages at any time. They
        cover two programs: messages to customers and prospects about their inquiries, appointments, and projects (Section 1), and optional internal
        notifications to ArkiTech team members through Command Center (Section 2). They supplement our{" "}
        <InlineLink href="/legal/privacy">Privacy Policy</InlineLink> and <InlineLink href="/legal/terms">Terms of Service</InlineLink>.
      </P>

      <Section id="consent" title="1. Customer Messages and Consent">
        <P>
          When you give ArkiTech your mobile number and check the box agreeing to be contacted - on a booking or inquiry form, during onboarding, or in
          writing - you agree to receive text messages from us at that number about the matter you contacted us about.
        </P>
        <P>Those messages may include:</P>
        <Bullets>
          <Bullet>Replies to an inquiry, quote request, or booking you submitted.</Bullet>
          <Bullet>Appointment and call confirmations, reminders, and scheduling changes.</Bullet>
          <Bullet>Updates on active project or service work.</Bullet>
          <Bullet>Answers to questions you send us by text.</Bullet>
        </Bullets>
        <P>
          Consent to receive text messages is not a condition of purchasing anything from us. You can ask us to communicate by email or phone instead.
        </P>
        <Callout>
          We do not sell mobile numbers, and we do not share them with third parties or affiliates for their own marketing. Your opt-in and consent are
          never shared with anyone.
        </Callout>
      </Section>

      {/* The internal program, described in the same words as the campaign
          registration. Keep the two in step: a reviewer compares them. */}
      <Section id="team" title="2. Internal Team Notifications (Command Center)">
        <P>
          ArkiTech team members may opt in to SMS notifications in Command Center under Settings &rarr; Text notifications. Messages include internal
          new-lead notifications, company announcements and system alerts.
        </P>
        <P>
          New-lead notification frequency varies as leads arrive; company announcements and system alerts total no more than 3 messages per week.
        </P>
        <P>
          Enrollment is optional and not required to use Command Center. Reply <strong className="font-semibold text-[var(--fg)]">STOP</strong> to opt out
          or <strong className="font-semibold text-[var(--fg)]">HELP</strong> for help. Message and data rates may apply.
        </P>
      </Section>

      <Section id="opt-out" title="3. Opt-Out Policy">
        <P>
          You can stop text messages at any time by replying <strong className="font-semibold text-[var(--fg)]">STOP</strong> to any message from us,
          whether it is a customer message or a Command Center notification. We will send one confirmation that you have been unsubscribed, and then no
          further texts to that number.
        </P>
        <P>
          Opting out of texts does not cancel anything else. You may still hear from us by email or phone where that is part of an active engagement, and
          you can ask us to stop those too by writing to us.
        </P>
        <P>
          To start again after opting out, reply <strong className="font-semibold text-[var(--fg)]">START</strong>, or just tell us. For help, reply{" "}
          <strong className="font-semibold text-[var(--fg)]">HELP</strong> or use the contact details below.
        </P>
      </Section>

      <Section id="frequency" title="4. Message Frequency and Rates">
        <P>
          Customer messages: message frequency varies. Texts are sent in response to what you have going on with us - an inquiry you sent, an appointment
          coming up, work in progress - rather than on a schedule, so there is no fixed number per month.
        </P>
        <P>
          Command Center notifications: new-lead notification frequency varies as leads arrive. Company announcements and system alerts together total no
          more than 3 messages per week.
        </P>
        <P>
          Message and data rates may apply according to your mobile carrier&rsquo;s plan. ArkiTech does not charge for text messages, and carriers are not
          liable for delayed or undelivered messages.
        </P>
        <P>Delivery is not guaranteed and depends on your carrier and device.</P>
      </Section>

      <Section id="privacy" title="5. Privacy">
        <P>
          Mobile numbers collected for text messaging are used only to send the messages described in these SMS Terms and for nothing else. We may share limited
          information with the vendors that actually deliver the messages - our telephony provider, Twilio - solely so the message reaches you.
        </P>
        <P>
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text messaging originator opt-in
          data and consent are not shared with any third parties.
        </P>
        <P>
          Our <InlineLink href="/legal/privacy">Privacy Policy</InlineLink> describes in full what we collect, how long we keep it, and the choices you
          have.
        </P>
      </Section>

      <Section id="contact" title="6. Support and Contact">
        <P>
          For questions about these SMS Terms, or for help with messages you have received from us, reply{" "}
          <strong className="font-semibold text-[var(--fg)]">HELP</strong> to any message or contact us at{" "}
          <StudioEmail />.
        </P>
        <Subhead>Postal address</Subhead>
        <ContactBlock />
      </Section>
    </article>
  );
}
