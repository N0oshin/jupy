import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo } from '../lib/useSeo'

export default function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy — Jupyter Labs',
    description: 'How Jupyter Labs collects, uses, and protects your personal information.',
    path: '/privacy-policy',
  })

  return (
    <PolicyLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Jupyter Labs respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you visit our website or place an order."
    >
      <PolicySection title="Information We Collect">
        <p>
          We may collect information such as your name, email address, billing and shipping details, order information,
          IP address, device information, and website activity.
        </p>
      </PolicySection>

      <PolicySection title="How We Use Information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Process and fulfill orders</li>
          <li>Communicate about purchases and customer service</li>
          <li>Improve our website and services</li>
          <li>Prevent fraud and maintain website security</li>
          <li>Send marketing communications where permitted</li>
          <li>Meet applicable legal requirements</li>
        </ul>
      </PolicySection>

      <PolicySection title="Information Sharing">
        <p>
          We may share necessary information with trusted providers that support payment processing, shipping, website
          hosting, analytics, customer service, and other business operations.
        </p>
        <p>We do not sell your personal information as a business practice.</p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          Our website may use cookies and similar technologies to improve functionality, understand website traffic, and
          enhance your experience. You can manage cookies through your browser settings.
        </p>
      </PolicySection>

      <PolicySection title="Data Security">
        <p>
          We use reasonable safeguards to protect your information. However, no online system can be guaranteed to be
          completely secure.
        </p>
      </PolicySection>

      <PolicySection title="Your Privacy Rights">
        <p>
          Depending on your location, you may have rights to access, correct, delete, or restrict the use of your
          personal information.
        </p>
      </PolicySection>

      <PolicySection title="Updates">
        <p>
          We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated date.
        </p>
      </PolicySection>

      <PolicySection title="Research Product Notice">
        <p>
          Jupyter Labs products are intended for laboratory research and R&amp;D purposes only, where applicable, and are
          not intended for human or veterinary consumption or medical use.
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
