import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo, SITE_URL } from '../lib/useSeo'

export default function RefundPolicy() {
  useSeo({
    title: 'Refund Policy — Jupyter Labs',
    description: 'Jupyter Labs returns and refund policy for research-use peptide orders.',
    path: '/refund-policy',
  })

  return (
    <PolicyLayout eyebrow="Legal" title="Refund Policy">
      <PolicySection title="Research-Use Products">
        <p>
          Thank you for choosing Jupyter Labs. We take great pride in delivering premium-quality research-use-only
          products. Please read the following carefully to understand our returns and refund process.
        </p>
        <p>
          All items sold by Jupyter Labs, including peptide pens and supplements, are intended strictly for research
          and development purposes. As such, they are not intended for human consumption, diagnosis, or treatment. By
          purchasing, you agree to these terms.
        </p>
      </PolicySection>

      <PolicySection title="Returns Eligibility">
        <p>
          Due to the sensitive nature of our products and to maintain quality assurance, we do not accept returns on
          opened or used items. Only unopened, unused items in original condition may be considered for return.
        </p>
      </PolicySection>

      <PolicySection title="Return Window">
        <p>
          Customers may request a return within 7 days of delivery. If 7 days have passed since your order was
          received, unfortunately we cannot offer a refund or exchange.
        </p>
      </PolicySection>

      <PolicySection title="Non-Returnable Items">
        <p>We are unable to accept returns for:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Opened or used items</li>
          <li>Products not stored correctly (e.g., not kept refrigerated)</li>
          <li>Items not in their original packaging</li>
          <li>Returns initiated after 7 days from delivery</li>
        </ul>
      </PolicySection>

      <PolicySection title="Reporting Issues">
        <p>
          If your order arrives damaged, incorrect, or defective, please contact our support team at{' '}
          <a href="mailto:support@voralabs.com" className="text-accent-dark underline">
            support@voralabs.com
          </a>{' '}
          within 48 hours of delivery. Include your order number, description of the issue, and supporting photos.
        </p>
      </PolicySection>

      <PolicySection title="Return Approval">
        <p>
          Once we receive your request, we will assess and notify you of approval status. If approved, we will issue
          return instructions. Return postage is the customer's responsibility unless the error was ours.
        </p>
      </PolicySection>

      <PolicySection title="Refund Processing">
        <p>
          Approved refunds will be processed to your original payment method within 5–10 business days. For crypto
          payments, the USD equivalent at the time of refund will be issued (minus any gas or transaction fees).
        </p>
      </PolicySection>

      <PolicySection title="Delayed Refunds">
        <p>If you haven't received your refund after 10 business days:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>First, check your bank.</li>
          <li>
            Then contact us at{' '}
            <a href="mailto:support@voralabs.com" className="text-accent-dark underline">
              support@voralabs.com
            </a>{' '}
            for assistance.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>For any related queries, please contact:</p>
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
