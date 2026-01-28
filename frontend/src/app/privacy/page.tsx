export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: Jan 2026</p>

        <div className="prose prose-slate dark:prose-invert mt-8">
          <p>
            Ultimate Apartment Manager ("we", "us") respects your privacy. This Privacy Policy explains what information we
            collect, how we use it, and your choices.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Account details (name, email, role)</li>
            <li>Lease information (dates, rent amount, status)</li>
            <li>Maintenance requests and attachments</li>
            <li>Payment metadata when enabled (handled by Stripe)</li>
          </ul>

          <h2>How We Use Information</h2>
          <ul>
            <li>Provide and improve the service</li>
            <li>Process maintenance and leases</li>
            <li>Send transactional notifications</li>
            <li>Secure the platform and prevent abuse</li>
          </ul>

          <h2>Storage & Security</h2>
          <p>
            Data is stored securely in our databases. Documents may be stored in S3. We implement industry-standard security
            controls and restrict access to authorized personnel.
          </p>

          <h2>Third Parties</h2>
          <p>
            We integrate with providers such as Stripe (payments) and Resend (email). Your data is shared only as needed to
            provide the service.
          </p>

          <h2>Your Rights</h2>
          <p>
            You can request access or deletion of your account data. Visit our <a href="/delete-account">Account Deletion</a> page
            to submit a request.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy inquiries, contact us via the <a href="/contact">Contact</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}

