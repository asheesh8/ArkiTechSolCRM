import type { Metadata } from "next";
import { Bullet, Bullets, Callout, ContactBlock, DocHeader, InlineLink, P, Section } from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Terms of Service · ArkiTech Solutions",
  description: "The terms that govern your access to and use of the ArkiTech Solutions website.",
};

export default function TermsOfServicePage() {
  return (
    <article>
      <DocHeader title="Terms of Service" updated="August 1, 2026" active="terms" />

      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the ArkiTech Solutions website located at{" "}
        <InlineLink href="https://arkitech-sol.com/">https://arkitech-sol.com/</InlineLink> and any related pages, forms, content, or online materials we
        make available through the website (collectively, the &ldquo;Site&rdquo;).
      </P>
      <P>
        The Site is operated by ArkiTech Solutions (&ldquo;ArkiTech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a digital product
        studio based in Burlington, Vermont. You can contact us at{" "}
        <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink>.
      </P>
      <P>
        These Terms apply to use of the Site. Paid client services, project work, retainers, statements of work, proposals, invoices, and other business
        engagements may be governed by separate written agreements. If there is a conflict between these Terms and a signed agreement between you and
        ArkiTech, the signed agreement controls for that engagement.
      </P>

      <Section id="acceptance" title="1. Acceptance of These Terms">
        <P>By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.</P>
        <P>
          You must be at least 18 years old, or the age of legal majority where you live, to submit a project inquiry or otherwise engage ArkiTech for
          business services.
        </P>
      </Section>

      <Section id="about" title="2. About ArkiTech">
        <P>
          ArkiTech designs and engineers websites, platforms, digital systems, customer-facing experiences, internal tools, automation, optimization work,
          and related technical services for growing teams and established organizations.
        </P>
        <P>
          Content on the Site is provided for general informational and promotional purposes. It does not create a client relationship, consulting
          engagement, partnership, employment relationship, or obligation for ArkiTech to provide services unless and until we enter into a separate written
          agreement with you.
        </P>
      </Section>

      <Section id="use" title="3. Use of the Site">
        <P>You agree to use the Site only for lawful purposes and in a way that does not interfere with the Site, our systems, or other users.</P>
        <P>You may not:</P>
        <Bullets>
          <Bullet>Attempt to gain unauthorized access to the Site, our systems, accounts, or data.</Bullet>
          <Bullet>Probe, scan, test, or bypass security or authentication measures.</Bullet>
          <Bullet>Introduce viruses, malware, harmful code, or automated traffic that disrupts the Site.</Bullet>
          <Bullet>Copy, scrape, harvest, or use Site content in a way that violates these Terms or applicable law.</Bullet>
          <Bullet>Misrepresent your identity, affiliation, business, or project needs.</Bullet>
          <Bullet>Use the Site to submit unlawful, infringing, defamatory, abusive, confidential, or highly sensitive information.</Bullet>
        </Bullets>
        <P>
          We may restrict, suspend, or block access to the Site if we believe a user has violated these Terms or created risk for ArkiTech, the Site, or
          others.
        </P>
      </Section>

      <Section id="submissions" title="4. Project Inquiries and User Submissions">
        <P>
          The Site may allow you to contact us, request a call, submit a project inquiry, or share information about your business needs. You are
          responsible for the accuracy and legality of any information you submit.
        </P>

        <Callout>
          Please do not submit passwords, payment card numbers, protected health information, regulated financial information, government identification
          numbers, trade secrets, or other highly sensitive information through general website forms or email unless we have specifically requested it
          through an appropriate secure process.
        </Callout>

        <P>
          By submitting information to us through the Site, you grant ArkiTech permission to review, use, and respond to that information for purposes such
          as evaluating your inquiry, communicating with you, preparing proposals, providing requested information, and operating our business.
        </P>
        <P>
          Submitting an inquiry does not require ArkiTech to accept your project, provide a proposal, maintain availability, or enter into an engagement.
        </P>
      </Section>

      <Section id="proposals" title="5. Proposals, Estimates, and Client Work">
        <P>
          Any examples of services, capabilities, timelines, or outcomes described on the Site are general in nature. Actual project scope, schedule,
          deliverables, pricing, responsibilities, ownership rights, hosting obligations, maintenance terms, warranties, and support commitments must be set
          out in a separate proposal, statement of work, service agreement, or other written agreement.
        </P>
        <P>Unless a separate written agreement says otherwise:</P>
        <Bullets>
          <Bullet>Estimates, timelines, and availability are not binding commitments.</Bullet>
          <Bullet>ArkiTech may decline or discontinue discussions about a potential engagement at any time.</Bullet>
          <Bullet>Client-provided materials remain the responsibility of the client.</Bullet>
          <Bullet>
            ArkiTech retains ownership of its pre-existing tools, methods, templates, know-how, processes, frameworks, and reusable code or design assets.
          </Bullet>
          <Bullet>
            No ownership or license rights transfer in any draft, concept, proposal, design, code, or deliverable until the applicable written agreement and
            payment terms are satisfied.
          </Bullet>
        </Bullets>
      </Section>

      <Section id="ip" title="6. Intellectual Property">
        <P>
          The Site and its content, including text, graphics, images, logos, visual designs, code, layout, service descriptions, and other materials, are
          owned by ArkiTech or our licensors and are protected by intellectual property and other laws.
        </P>
        <P>
          You may view and use the Site for your own internal, informational, and business evaluation purposes. You may not copy, reproduce, distribute,
          modify, publicly display, create derivative works from, or commercially exploit Site content without our prior written permission, except where
          permitted by law.
        </P>
        <P>
          All trademarks, service marks, logos, and brand names appearing on the Site are the property of their respective owners. Use of any third-party
          name, mark, or project reference does not imply endorsement unless expressly stated.
        </P>
      </Section>

      <Section id="portfolio" title="7. Portfolio and Case Study Content">
        <P>
          The Site may display examples of work, portfolio items, client names, project descriptions, screenshots, links, or case study information.
          Portfolio content is provided to illustrate the type of work ArkiTech performs and does not guarantee that a future project will produce the same
          result.
        </P>
        <P>
          Third-party websites linked from portfolio entries are controlled by their respective owners. ArkiTech is not responsible for third-party content,
          availability, security, privacy practices, or changes made after project launch unless expressly agreed in writing.
        </P>
      </Section>

      <Section id="third-party" title="8. Third-Party Services and Links">
        <P>
          The Site may link to or integrate with third-party websites, tools, hosting providers, analytics services, scheduling tools, communication
          platforms, payment processors, embedded content, or other services. We are not responsible for third-party services, and your use of them may be
          subject to separate terms and privacy policies.
        </P>
      </Section>

      <Section id="communications" title="9. Communications">
        <P>
          If you contact us through the Site, by email, by phone, or through another channel, you authorize us to respond using the contact information you
          provide. Communications may include project-related messages, scheduling, proposals, business updates, or other information related to your
          inquiry or relationship with ArkiTech.
        </P>
        <P>
          You may opt out of non-essential marketing communications by following the unsubscribe instructions in the message, if provided, or by contacting
          us at <InlineLink href="mailto:hello@arkitech-sol.com">hello@arkitech-sol.com</InlineLink>.
        </P>
      </Section>

      <Section id="warranties" title="10. Disclaimer of Warranties">
        <P>
          The Site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the fullest extent permitted by law, ArkiTech disclaims all
          warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, uninterrupted
          availability, accuracy, reliability, security, or error-free operation.
        </P>
        <P>
          We do not warrant that the Site will always be available, secure, accurate, complete, current, or free from harmful components. We may update,
          modify, suspend, or discontinue any part of the Site at any time.
        </P>
      </Section>

      <Section id="liability" title="11. Limitation of Liability">
        <P>
          To the fullest extent permitted by law, ArkiTech and its owners, directors, officers, employees, contractors, agents, and service providers will
          not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages, or for any loss of profits, revenue, business,
          goodwill, data, or opportunities, arising from or related to your use of the Site.
        </P>
        <P>
          To the fullest extent permitted by law, ArkiTech&rsquo;s total liability for any claim arising from or related to the Site or these Terms will not
          exceed one hundred U.S. dollars (US $100).
        </P>
        <P>Some jurisdictions do not allow certain limitations of liability, so some of the above limitations may not apply to you.</P>
      </Section>

      <Section id="indemnification" title="12. Indemnification">
        <P>
          You agree to defend, indemnify, and hold harmless ArkiTech and its owners, directors, officers, employees, contractors, agents, and service
          providers from and against any claims, damages, liabilities, losses, costs, and expenses, including reasonable attorneys&rsquo; fees, arising out
          of or related to:
        </P>
        <Bullets>
          <Bullet>Your use or misuse of the Site.</Bullet>
          <Bullet>Your violation of these Terms.</Bullet>
          <Bullet>Information or materials you submit to us.</Bullet>
          <Bullet>Your violation of applicable law or third-party rights.</Bullet>
        </Bullets>
      </Section>

      <Section id="law" title="13. Governing Law and Venue">
        <P>These Terms are governed by the laws of the State of Vermont, without regard to conflict-of-law rules.</P>
        <P>
          Subject to any rights you may have under applicable law, you agree that any dispute arising from or related to the Site or these Terms will be
          brought in the state or federal courts located in Vermont, and you consent to the personal jurisdiction of those courts.
        </P>
      </Section>

      <Section id="changes" title="14. Changes to the Site or Terms">
        <P>
          We may update the Site and these Terms from time to time. When we update these Terms, we will revise the &ldquo;Last updated&rdquo; date above.
          Your continued use of the Site after changes are posted means you accept the updated Terms.
        </P>
        <P>
          For material changes, we may provide additional notice where appropriate, such as by posting a notice on the Site or contacting users where we have
          an appropriate contact method.
        </P>
      </Section>

      <Section id="contact" title="15. Contact">
        <P>If you have questions about these Terms, contact us at:</P>
        <ContactBlock />
      </Section>
    </article>
  );
}
