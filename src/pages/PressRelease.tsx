import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo, SITE_URL } from '../lib/useSeo'

export default function PressRelease() {
  useSeo({
    title: 'Press Release — Jupyter Labs',
    description: 'Official public statement from Jupyter Labs on regulatory compliance and research-use standards.',
    path: '/press-release',
  })

  return (
    <PolicyLayout
      eyebrow="Public Statement"
      title="Official Statement from Jupyter Labs"
      intro="A public statement on our research focus, regulatory compliance, and standards for engaging with Jupyter Labs."
    >
      <PolicySection title="1. About Jupyter Labs">
        <p>
          Jupyter Labs operates as a research and development supplier of laboratory-grade peptides and amino acid
          compounds. All products are manufactured and supplied strictly for laboratory research and in-vitro study —
          never for human or veterinary use, diagnosis, or treatment.
        </p>
      </PolicySection>

      <PolicySection title="2. No Social Media Sales or Promotion">
        <p>
          Jupyter Labs does not operate on TikTok, Facebook, Instagram, WhatsApp, or similar platforms. Any page or
          individual claiming to represent Jupyter Labs on social media is unauthorised and may be an attempt to
          solicit fraudulent payments. Please verify any communication directly through{' '}
          <a href="mailto:support@voralabs.com" className="text-accent-dark underline">
            support@voralabs.com
          </a>{' '}
          before making any payment.
        </p>
      </PolicySection>

      <PolicySection title="3. Regulatory Status — Lawful R&D Operations">
        <p>Jupyter Labs operates under the applicable UK and EU regulatory framework for research suppliers, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Companies Act 2006</li>
          <li>Health and Safety at Work Act 1974 and COSHH Regulations 2002 — chemical safety in laboratories</li>
          <li>REACH Regulation (EC 1907/2006) and CLP Regulation (EC 1272/2008) — classification and labelling</li>
          <li>General Product Safety Regulations 2005 — non-hazardous packaging</li>
        </ul>
        <p>
          Every product carries the statement: "For laboratory research and development purposes only. Not for human
          or veterinary use."
        </p>
      </PolicySection>

      <PolicySection title="4. Misrepresentation by Third Parties">
        <p>
          The Jupyter Labs name and branding may not be used without our consent. Unauthorised use of our name,
          logo, or product imagery by third-party sellers is not endorsed by us and may constitute passing off and a
          breach of the Consumer Protection from Unfair Trading Regulations 2008. We monitor for and act on
          impersonation where identified.
        </p>
      </PolicySection>

      <PolicySection title="5. Quality & Ethical Standards">
        <p>Jupyter Labs operates under internal standard operating procedures reflecting Good Laboratory Practice (GLP) and ISO 9001:2015 quality standards, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Batch traceability and documentation, with a Certificate of Analysis issued per batch</li>
          <li>Cold-chain handling where required</li>
          <li>Non-hazardous packaging in line with applicable transport regulations</li>
          <li>Prominent research-use-only disclaimers on all product listings and packaging</li>
        </ul>
        <p>
          We advise against purchasing our products via any unverified reseller or social media account. Jupyter
          Labs distributes solely through its official website for institutional and analytical use.
        </p>
      </PolicySection>

      <PolicySection title="6. Contact Us">
        <p>For press or compliance-related enquiries, please contact:</p>
        <p>
          Email:{' '}
          <a href="mailto:support@voralabs.com" className="text-accent-dark underline">
            support@voralabs.com
          </a>
          <br />
          Website: {SITE_URL}
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
