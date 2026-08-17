import type { Metadata } from "next";
import { Bullet, Bullets, Callout, ContactBlock, DocHeader, InlineLink, P, Section, Subhead } from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Privacy Policy · ArkiTech Solutions",
  description:
    "How ArkiTech Solutions collects, uses, discloses, and protects personal information when you visit our site or contact us.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <DocHeader title="Privacy Policy" updated="August 17, 2026" active="privacy" />

      <P>
        This Privacy Policy explains how ArkiTech Solutions (&ldquo;ArkiTech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
        uses, discloses, and protects personal information when you visit{" "}
        <InlineLink href="https://arkitech-sol.com/">https://arkitech-sol.com/</InlineLink>, contact us, submit a project inquiry, request information, or
        otherwise interact with us online or in connection with our business.
      </P>
      <P>
        ArkiTech is a Burlington, Vermont digital product studio. You can contact us at{" "}
        <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink>.
      </P>
      <P>
        This Privacy Policy applies to our website and general business communications. A separate client agreement, statement of work, data processing
        agreement, or similar contract may govern personal information we process on behalf of clients in connection with paid services.
      </P>

      <Section id="collect" title="1. Personal Information We Collect">
        <P>We may collect personal information directly from you, automatically through the website, and from third-party sources.</P>

        <Subhead>Information you provide to us</Subhead>
        <P>When you contact us, request a call, submit a project inquiry, or communicate with ArkiTech, we may collect:</P>
        <Bullets>
          <Bullet>Name.</Bullet>
          <Bullet>Business name and role.</Bullet>
          <Bullet>Email address.</Bullet>
          <Bullet>Phone number.</Bullet>
          <Bullet>Location.</Bullet>
          <Bullet>Project details, business needs, goals, budget, timeline, and other information you choose to share.</Bullet>
          <Bullet>Communications with us, including email, phone, form submissions, and related records.</Bullet>
          <Bullet>Billing, payment, or contract information if you become a client, handled through appropriate business systems.</Bullet>
        </Bullets>

        <Callout>
          Please do not submit passwords, payment card numbers, protected health information, government identification numbers, trade secrets, or other
          highly sensitive information through general website forms or email unless we specifically request it through an appropriate secure process.
        </Callout>

        <Subhead>Information collected automatically</Subhead>
        <P>When you visit the website, we and our service providers may automatically collect:</P>
        <Bullets>
          <Bullet>IP address.</Bullet>
          <Bullet>Device type, browser type, and operating system.</Bullet>
          <Bullet>Referring and exit pages.</Bullet>
          <Bullet>Pages viewed and approximate visit times.</Bullet>
          <Bullet>General location derived from IP address.</Bullet>
          <Bullet>Site performance, error, and diagnostic data.</Bullet>
          <Bullet>Cookie, pixel, or similar technology data.</Bullet>
        </Bullets>

        <Subhead>Information from third parties</Subhead>
        <P>
          We may receive information from third-party services we use to operate our business, such as hosting providers, analytics providers, email
          systems, CRM tools, scheduling tools, payment processors, advertising platforms, security tools, or public business sources.
        </P>
      </Section>

      <Section id="use" title="2. How We Use Personal Information">
        <P>We may use personal information to:</P>
        <Bullets>
          <Bullet>Operate, maintain, secure, and improve the website.</Bullet>
          <Bullet>Respond to inquiries and communicate with you.</Bullet>
          <Bullet>Evaluate project fit, prepare proposals, schedule calls, and manage business opportunities.</Bullet>
          <Bullet>Provide services to clients and administer client relationships.</Bullet>
          <Bullet>Send service-related messages, administrative notices, invoices, and project communications.</Bullet>
          <Bullet>Send marketing or business updates where permitted by law.</Bullet>
          <Bullet>Analyze website traffic, performance, and user interaction.</Bullet>
          <Bullet>Protect against fraud, abuse, security incidents, and misuse of the website.</Bullet>
          <Bullet>Comply with legal, regulatory, tax, accounting, and contractual obligations.</Bullet>
          <Bullet>Enforce our Terms of Service and other agreements.</Bullet>
        </Bullets>
      </Section>

      <Section id="cookies" title="3. Cookies and Similar Technologies">
        <P>
          We may use cookies, pixels, local storage, analytics tags, and similar technologies to operate the website, remember preferences, understand site
          traffic, improve performance, measure marketing effectiveness, and secure our services.
        </P>
        <P>
          You can usually adjust your browser settings to block or delete cookies. Some website features may not function properly if cookies are disabled.
        </P>
        <P>
          If we use analytics or advertising tools, those providers may set their own cookies or similar technologies. Your choices may also be available
          through those third-party providers or applicable industry opt-out tools.
        </P>
      </Section>

      <Section id="share" title="4. How We Share Personal Information">
        <P>We do not sell personal information in the ordinary sense of exchanging it for money.</P>
        <P>We may share personal information with:</P>
        <Bullets>
          <Bullet>
            Service providers that help us operate the website and business, such as hosting, analytics, email, CRM, scheduling, payment processing,
            security, storage, communications, and professional services providers.
          </Bullet>
          <Bullet>
            Contractors, collaborators, or project partners who help us evaluate or deliver services, subject to appropriate confidentiality or contractual
            obligations.
          </Bullet>
          <Bullet>Clients or business contacts when necessary to provide services or manage an engagement.</Bullet>
          <Bullet>
            Legal, regulatory, or government authorities when required by law or when we believe disclosure is necessary to protect rights, safety,
            security, or legal interests.
          </Bullet>
          <Bullet>
            Parties involved in a business transaction, such as a merger, acquisition, financing, reorganization, sale of assets, or similar event.
          </Bullet>
          <Bullet>Other parties with your consent or at your direction.</Bullet>
        </Bullets>

        {/* Required by US mobile carriers for A2P 10DLC campaign registration.
            The wording is close to prescribed — reviewers look for these exact
            commitments, so edit it only with that in mind. It sits directly
            under the sharing categories because it carves an exception out of
            them, and "the above categories" has to have something above it. */}
        <Subhead>Mobile and text messaging information</Subhead>
        <P>
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All of the above categories exclude
          text messaging originator opt-in data and consent; this information will not be shared with any third parties.
        </P>

        <P>
          Some privacy laws define &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; broadly to include certain advertising, analytics, or tracking activities. If
          we engage in activities that qualify as a sale or sharing under applicable law, we will provide any required notices and choices.
        </P>
      </Section>

      <Section id="retention" title="5. Data Retention">
        <P>
          We keep personal information for as long as reasonably necessary for the purposes described in this Privacy Policy, including to respond to
          inquiries, manage client relationships, provide services, maintain business records, comply with legal obligations, resolve disputes, and enforce
          agreements.
        </P>
        <P>
          Retention periods vary depending on the type of information, the context in which it was collected, legal requirements, and operational needs.
          When information is no longer needed, we may delete, de-identify, or archive it.
        </P>
      </Section>

      <Section id="security" title="6. Data Security">
        <P>
          We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. However, no website, email
          system, network, or storage system can be guaranteed to be completely secure.
        </P>
        <P>
          You are responsible for using secure channels when sharing sensitive information with us and for avoiding the submission of highly sensitive
          information through general website forms or standard email unless we specifically request it through an appropriate secure process.
        </P>
      </Section>

      <Section id="choices" title="7. Your Privacy Choices">
        <P>Depending on where you live and the laws that apply, you may have rights to:</P>
        <Bullets>
          <Bullet>Request access to the personal information we maintain about you.</Bullet>
          <Bullet>Request correction of inaccurate personal information.</Bullet>
          <Bullet>Request deletion of personal information.</Bullet>
          <Bullet>Request a copy of certain personal information in a portable format.</Bullet>
          <Bullet>Object to or restrict certain processing.</Bullet>
          <Bullet>Opt out of certain marketing communications.</Bullet>
          <Bullet>Opt out of certain targeted advertising, sale, or sharing activities, if applicable.</Bullet>
          <Bullet>Appeal a decision we make about a privacy request, where required by law.</Bullet>
        </Bullets>
        <P>
          To make a privacy request, contact us at <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink>. We may need to
          verify your identity before processing your request. We will respond as required by applicable law.
        </P>
        <P>
          You may unsubscribe from non-essential marketing emails by using the unsubscribe link in the email, if available, or by contacting us at{" "}
          <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink>. We may still send non-marketing messages, such as responses
          to inquiries, project communications, invoices, legal notices, and administrative updates.
        </P>
      </Section>

      <Section id="dnt" title="8. Do Not Track and Global Privacy Controls">
        <P>
          Some browsers offer &ldquo;Do Not Track&rdquo; signals. Because there is not a uniform industry standard for responding to these signals, the
          website may not respond to them.
        </P>
        <P>
          Where required by applicable law, we will honor recognized browser-based opt-out preference signals, such as Global Privacy Control, for
          activities covered by those laws.
        </P>
      </Section>

      <Section id="children" title="9. Children&rsquo;s Privacy">
        <P>
          The website is intended for business users and is not directed to children under 13. We do not knowingly collect personal information from
          children under 13.
        </P>
        <P>
          If you believe a child has provided personal information to us, contact us at{" "}
          <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink> and we will take appropriate steps to delete it.
        </P>
      </Section>

      <Section id="international" title="10. International Visitors">
        <P>
          ArkiTech is based in the United States. If you access the website from outside the United States, your information may be processed in the United
          States or other countries where we or our service providers operate. Those countries may have data protection laws that differ from the laws where
          you live.
        </P>
      </Section>

      <Section id="client-data" title="11. Client Data">
        <P>
          As a digital product studio, we may process personal information on behalf of clients when building, maintaining, optimizing, or supporting
          websites, platforms, internal tools, automation, or related systems.
        </P>
        <P>
          When we process personal information on behalf of a client, the client&rsquo;s privacy policy and instructions may apply. The relevant client
          agreement, statement of work, data processing agreement, or similar contract will govern our role and responsibilities for that client data.
        </P>
      </Section>

      <Section id="third-party" title="12. Third-Party Websites">
        <P>
          The website may link to third-party websites, portfolio projects, tools, platforms, or services. We are not responsible for the privacy practices,
          content, security, or availability of third-party websites or services. Review their privacy policies before providing personal information to
          them.
        </P>
      </Section>

      <Section id="changes" title="13. Changes to This Privacy Policy">
        <P>
          We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date above. If we make material
          changes, we may provide additional notice where appropriate, such as by posting a notice on the website or contacting you if we have an appropriate
          contact method.
        </P>
      </Section>

      <Section id="contact" title="14. Contact Us">
        <P>If you have questions about this Privacy Policy or want to exercise a privacy right, contact us at:</P>
        <ContactBlock />
      </Section>
    </article>
  );
}
