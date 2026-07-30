import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo, SITE_URL } from '../lib/useSeo'

export default function TermsOfService() {
  useSeo({
    title: 'Terms of Service — Jupyter Labs',
    description: 'The terms and conditions governing use of the Jupyter Labs website and products.',
    path: '/terms-of-service',
  })

  return (
    <PolicyLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro='You are using the official website of Jupyter Labs ("we", "us", "our"). By using this site, you agree to comply with the following terms. Please read them carefully. If you do not agree with any part of these terms, please do not use our website or services.'
    >
      <PolicySection title="General">
        <p>
          These Terms govern your use of this website. We may update these Terms from time to time without notice.
          Continued use of the website constitutes acceptance of the current Terms.
        </p>
      </PolicySection>

      <PolicySection title="Age Requirement">
        <p>
          By accessing this site, you confirm that you are at least 18 years old and are legally able to enter into
          contracts. Our products and services are intended only for individuals who meet this requirement.
        </p>
      </PolicySection>

      <PolicySection title="Product Use">
        <p>
          Products sold on this website are supplied strictly for research and development purposes under controlled
          conditions. They are not to be used for diagnosis, treatment, or prevention of any disease or medical
          condition.
        </p>
      </PolicySection>

      <PolicySection title="Orders & Payment">
        <p>
          All orders are subject to acceptance and availability. We reserve the right to refuse or cancel orders at
          our discretion. Payment must be made in full before orders are dispatched.
        </p>
      </PolicySection>

      <PolicySection title="Dispatch & Delivery">
        <p>
          We aim to dispatch orders within a reasonable timeframe — as a standard, within 2 days, with next-day
          delivery within the UK. Shipping timelines are not guaranteed and may be affected by external factors. We
          are not liable for delays beyond our control. See our{' '}
          <a href="/shipping-policy" className="text-accent-dark underline">
            Shipping Policy
          </a>{' '}
          for details.
        </p>
      </PolicySection>

      <PolicySection title="Refund Policy">
        <p>
          Due to the nature of our products, returns are only accepted for items that are unopened, unused, and in
          their original condition. Opened or tampered-with items are non-refundable. See our{' '}
          <a href="/refund-policy" className="text-accent-dark underline">
            Refund Policy
          </a>{' '}
          for details.
        </p>
      </PolicySection>

      <PolicySection title="Disclaimer">
        <p>
          All products are sold solely for laboratory R&D. Jupyter Labs does not accept or condone misuse, including
          but not limited to human consumption, veterinary use, or resale.
        </p>
      </PolicySection>

      <PolicySection title="Limitation of Liability">
        <p>
          By using this site, you agree to indemnify and hold harmless Jupyter Labs, its directors, and affiliates
          from any claims, damages, or liabilities arising from product use or non-use under these Terms.
        </p>
      </PolicySection>

      <PolicySection title="Account Responsibility">
        <p>
          If you create an account on our website, you are responsible for maintaining the confidentiality of your
          log-in credentials. All activities conducted under your account are your responsibility.
        </p>
      </PolicySection>

      <PolicySection title="Intellectual Property">
        <p>
          All trademarks, logos, and content displayed on this website are owned or licensed by Jupyter Labs. You may
          not reproduce, distribute, or commercially exploit any content without prior written consent.
        </p>
      </PolicySection>

      <PolicySection title="Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes
          arising will be subject to the exclusive jurisdiction of the UK courts.
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>For any related queries, please contact:</p>
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
