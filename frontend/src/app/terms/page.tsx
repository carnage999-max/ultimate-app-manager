export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: Jan 2026</p>

        <div className="prose prose-slate dark:prose-invert mt-8">
          <h2>Agreement</h2>
          <p>
            By using Ultimate Apartment Manager (the "Service"), you agree to these Terms. If you do not agree, do not use the
            Service.
          </p>

          <h2>Use of Service</h2>
          <ul>
            <li>You must provide accurate information and keep your account secure.</li>
            <li>You are responsible for activities under your account.</li>
            <li>Do not misuse the Service or attempt to access it using methods not provided by us.</li>
          </ul>

          <h2>Leases & Maintenance</h2>
          <p>
            Lease data and maintenance requests are provided by administrators and tenants. We are not liable for inaccuracies
            provided by users.
          </p>

          <h2>Payments</h2>
          <p>
            When enabled, payments are processed by Stripe. You agree to Stripe’s terms and applicable fees.
          </p>

          <h2>Content & Files</h2>
          <p>
            Files uploaded to the Service may be stored in S3. You grant us a limited license to host files for the purpose of
            operating the Service.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms. You may request account deletion at any time via the
            <a href="/delete-account"> deletion page</a>.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these Terms. Material updates will be communicated via the Service.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Reach us via the <a href="/contact">Contact</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}

