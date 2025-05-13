
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TermsOfService() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span className="text-primary">📜</span> Terms of Service
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 text-sm sm:text-base">
        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">1. Purpose</h3>
          <p>
            This document defines the terms of use for the <strong>FamilyCloud</strong> website, 
            accessible via <a href="https://family-cloud.mysa-tech.fr" className="text-primary hover:underline">family-cloud.mysa-tech.fr</a>.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">2. Service Access</h3>
          <p>The service is accessible to users with an account. It allows:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Exchanging messages between members of the same family group</li>
            <li>Securely sharing files</li>
            <li>Managing personal data from your user area</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">3. Account Creation</h3>
          <p>
            The user must provide a valid email address. They are solely responsible for 
            maintaining the confidentiality of their credentials.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">4. User Commitments</h3>
          <p>The user agrees to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Not share illegal, violent, or inappropriate content</li>
            <li>Respect other members</li>
            <li>Not attempt to harm the proper functioning of the service</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">5. Data and Confidentiality</h3>
          <p>
            Data is processed in accordance with the Privacy Policy described above.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">6. Liability Limitations</h3>
          <p>The publisher cannot be held responsible in case of:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Service outages beyond their control</li>
            <li>Data loss related to non-compliant user behavior</li>
            <li>Malicious intrusion despite security measures</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">7. Intellectual Property</h3>
          <p>
            All content (logo, design, code, texts, etc.) remains the exclusive property of the publisher, 
            except for files or messages sent by users.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">8. Terms Evolution</h3>
          <p>
            Terms of service may be updated at any time. Users will be informed in case of significant changes.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
