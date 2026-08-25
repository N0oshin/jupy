import PolicyLayout, { PolicySection } from '../components/PolicyLayout'
import { useSeo } from '../lib/useSeo'

const SUPPORT_EMAIL = 'support@jupyterlabs.com'

export default function TermsOfService() {
  useSeo({
    title: 'Terms & Conditions — Jupyter Labs',
    description: 'The terms and conditions governing use of the Jupyter Labs website and products.',
    path: '/terms-of-service',
  })

  return (
    <PolicyLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="By using the Jupyter Labs website or placing an order, you agree to these Terms & Conditions."
    >
      <PolicySection title="Research Use Only">
        <p>
          Jupyter Labs products are intended for legitimate laboratory research and R&amp;D purposes only, where
          applicable. They are not intended for human or veterinary consumption, self-administration, diagnosis,
          treatment, or prevention of disease.
        </p>
        <p>
          Customers are responsible for ensuring that their purchase and intended research use comply with applicable
          laws and regulations.
        </p>
      </PolicySection>

      <PolicySection title="Products & Information">
        <p>
          We make reasonable efforts to keep product descriptions, specifications, availability, and pricing accurate.
          Information may change without notice.
        </p>
        <p>
          Where provided, certificates of analysis (COAs) relate to specific batches and are supplied as analytical
          documentation.
        </p>
      </PolicySection>

      <PolicySection title="Orders & Payment">
        <p>
          We reserve the right to accept, limit, or cancel orders due to availability, payment issues, regulatory
          restrictions, suspected fraud, or other legitimate reasons.
        </p>
        <p>Prices and availability may change without notice.</p>
      </PolicySection>

      <PolicySection title="Shipping">
        <p>
          Customers are responsible for providing accurate shipping information and ensuring that products can legally
          be purchased, received, and used in their jurisdiction.
        </p>
        <p>
          Delivery times are estimates and may be affected by carriers, customs, weather, or other circumstances beyond
          our control.
        </p>
      </PolicySection>

      <PolicySection title="Returns & Refunds">
        <p>
          Returns and refunds are subject to our applicable return policy. Contact us before returning any product.
        </p>
        {/* Verbatim from the Terms sheet (gid=1346852044, row 33), which supplies
            the domain with no mailbox name. Deliberately NOT a mailto: link —
            "mailto:@jupyterlabs.com" is not a valid address and would render as a
            dead link. Restore the <a> once the sheet cell carries a full address. */}
        <p>Email: @jupyterlabs.com</p>
      </PolicySection>

      <PolicySection title="Product Handling">
        <p>
          Customers are responsible for following the storage and handling instructions provided with each product.
          Jupyter Labs is not responsible for damage or degradation resulting from improper storage or handling.
        </p>
      </PolicySection>

      <PolicySection title="Intellectual Property">
        <p>
          All website content, including text, images, branding, logos, and product information, belongs to or is
          licensed by Jupyter Labs and may not be reproduced without permission.
        </p>
      </PolicySection>

      <PolicySection title="Disclaimer">
        <p>
          Website content is provided for informational and research purposes and does not constitute medical, clinical,
          or professional advice.
        </p>
      </PolicySection>

      <PolicySection title="Changes to These Terms">
        <p>
          We may update these Terms from time to time. Continued use of the website after changes are posted constitutes
          acceptance of the updated Terms where permitted by law.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p className="font-medium text-ink">Jupyter Labs</p>
        <p>
          Email:{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent-dark underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </PolicySection>

      <PolicySection title="Research Notice">
        <p>
          Jupyter Labs products are supplied for laboratory research and R&amp;D use only, where applicable, and are not
          intended for human or veterinary consumption.
        </p>
      </PolicySection>
    </PolicyLayout>
  )
}
