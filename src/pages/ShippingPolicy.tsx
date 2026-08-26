import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo, SITE_URL } from '../lib/useSeo'

export default function ShippingPolicy() {
  useSeo({
    title: 'Shipping Policy — Jupyter Labs',
    description: 'How Jupyter Labs orders are processed, dispatched, and delivered.',
    path: '/shipping-policy',
  })

  return (
    <PolicyLayout
      eyebrow="Legal"
      title="Shipping Policy"
      intro="This Shipping Policy outlines how orders placed on our website are processed, dispatched, and delivered."
    >
      <PolicySection title="Dispatch Time">
        <p>
          Orders placed and paid for before 3pm (UK time) on working days are typically dispatched the same day.
          Orders received after 3pm or on weekends/public holidays are dispatched the next working day.
        </p>
      </PolicySection>

      <PolicySection title="Shipping Carriers">
        <p>
          We use tracked and signed-for courier services (e.g., UPS, Royal Mail, DPD) depending on destination,
          weight, and service availability. Once shipped, you will receive tracking information by email or SMS.
        </p>
      </PolicySection>

      <PolicySection title="Delivery Times">
        <ul className="list-disc space-y-1 pl-5">
          <li>UK Orders: Typically delivered next working day after dispatch.</li>
          <li>International Orders: Delivery times vary by location and customs handling, but usually range from 3–10 working days.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Shipping Fees">
        <p>
          Shipping costs are shown at checkout, calculated based on your location and parcel weight. We occasionally
          offer free shipping promotions.
        </p>
      </PolicySection>

      <PolicySection title="Order Tracking">
        <p>
          All shipments include tracking. You'll receive a tracking number once your parcel leaves our fulfilment
          centre — you can also check status any time on our{' '}
          <a href="/track" className="text-accent-dark underline">
            order tracking page
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="Failed Delivery Attempts">
        <p>
          If no one is available to accept the parcel, the courier may leave a calling card or attempt redelivery. You
          must follow up with the courier directly using your tracking number.
        </p>
      </PolicySection>

      <PolicySection title="Customs & Import Duties">
        <p>
          International buyers are responsible for any applicable customs duties, VAT, or import taxes. These charges
          are not included in our product or shipping prices.
        </p>
      </PolicySection>

      <PolicySection title="Delivery Issues">
        <p>
          If your parcel is delayed, lost, or arrives damaged, please contact us at{' '}
          <a href="mailto:support@voralabs.com" className="text-accent-dark underline">
            support@voralabs.com
          </a>{' '}
          within 72 hours of the expected delivery date. Include your order number and tracking details.
        </p>
      </PolicySection>

      <PolicySection title="Address Accuracy">
        <p>
          Ensure your delivery details are entered correctly. We cannot be held responsible for delivery issues
          resulting from incorrect or incomplete address information.
        </p>
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
