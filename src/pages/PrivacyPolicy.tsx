import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo, SITE_URL } from '../lib/useSeo'

export default function PrivacyPolicy() {
  useSeo({
    title: 'Privacy Policy — Jupyter Labs',
    description: 'How Jupyter Labs collects, uses, and protects your personal information.',
    path: '/privacy-policy',
  })

  return (
    <PolicyLayout eyebrow="Legal" title="Privacy Policy">
      <PolicySection title="Introduction">
        <p>
          This Privacy Policy explains how Jupyter Labs ("we", "us", "our") collects, uses, and protects your personal
          information when you visit or make a purchase from our website.
        </p>
        <p>We are committed to safeguarding your privacy and complying with UK GDPR and the Data Protection Act 2018.</p>
      </PolicySection>

      <PolicySection title="What We Collect">
        <p>We may collect and process the following types of data:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name and contact details</li>
          <li>Shipping and billing addresses</li>
          <li>Email correspondence or messages</li>
          <li>Purchase history and transaction details</li>
          <li>Technical data like IP address, browser type, and device information</li>
        </ul>
      </PolicySection>

      <PolicySection title="How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Process and fulfill orders</li>
          <li>Provide customer service and order updates</li>
          <li>Respond to enquiries or requests</li>
          <li>Improve website functionality and experience</li>
          <li>Comply with legal or regulatory obligations</li>
        </ul>
        <p>Note: We do not sell or rent your data to third parties.</p>
      </PolicySection>

      <PolicySection title="Third-Party Sharing">
        <p>We only share data with trusted third-party providers who help us operate our business, such as:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Payment processors</li>
          <li>Couriers and logistics providers</li>
          <li>Website and IT service platforms</li>
        </ul>
        <p>All third parties are required to process your data securely and only as instructed by us.</p>
      </PolicySection>

      <PolicySection title="Data Security">
        <p>We implement appropriate security measures to protect your personal information, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Secure Socket Layer (SSL) encryption on our website</li>
          <li>Limited access to data by authorised staff only</li>
          <li>Regular reviews of data security practices</li>
        </ul>
      </PolicySection>

      <PolicySection title="Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access the personal data we hold on you</li>
          <li>Request corrections to inaccurate information</li>
          <li>Request data deletion (where appropriate)</li>
          <li>Object to certain processing activities</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>
          To exercise your rights, contact{' '}
          <a href="mailto:support@jupyterlabs.example.com" className="text-accent-dark underline">
            support@jupyterlabs.example.com
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          We use cookies to enhance your experience and track usage patterns. You can manage or disable cookies in
          your browser settings at any time.
        </p>
      </PolicySection>

      <PolicySection title="Data Retention">
        <p>
          We retain your data only for as long as necessary to fulfill the purposes outlined in this policy,
          including legal, accounting, or regulatory obligations.
        </p>
      </PolicySection>

      <PolicySection title="Policy Updates">
        <p>We may update this Privacy Policy periodically. Any changes will be posted here with a new effective date.</p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>For any data-related queries, please contact:</p>
        <p>
          Email:{' '}
          <a href="mailto:support@jupyterlabs.example.com" className="text-accent-dark underline">
            support@jupyterlabs.example.com
          </a>
          <br />
          Website: {SITE_URL}
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
