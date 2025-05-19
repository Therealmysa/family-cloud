
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivacyPolicy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">🔒</span> Privacy Policy (GDPR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">1. Data Controller</h3>
          <p>The data controller is:</p>
          <p><strong>AIT TAYEB Samy</strong><br />
          Contact email: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">2. Data Collected</h3>
          <p>When you use this website, we only collect data strictly necessary for the proper functioning of the service, including:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Login credentials (email, username)</li>
            <li>Message data and shared files</li>
            <li>IP address (for security purposes)</li>
            <li>Browsing data (via cookies or internal tools)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">3. Purpose of Processing</h3>
          <p>This data is used to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Enable access to and functioning of the platform</li>
            <li>Facilitate communication between family members</li>
            <li>Ensure service security</li>
            <li>Improve user experience</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">4. Storage and Security</h3>
          <p>
            Data is hosted on <strong>Lovable.dev</strong> servers, in compliance with European standards.
            Technical measures are in place to ensure their confidentiality, integrity, and availability.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">5. Retention Period</h3>
          <ul className="list-disc pl-6 mt-2">
            <li>Account data: as long as the user has not deleted their account</li>
            <li>Messages and files: according to service usage (deletable by the user)</li>
            <li>Cookies: maximum duration of 13 months</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">6. Your Rights</h3>
          <p>In accordance with GDPR, you have the right to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Access your data</li>
            <li>Correct or delete your data</li>
            <li>Object to its processing</li>
            <li>Request data portability</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us at: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
