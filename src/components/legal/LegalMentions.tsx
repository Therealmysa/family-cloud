
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LegalMentions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Legal Notices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 text-sm sm:text-base">
        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">Website Publisher</h3>
          <p>This website is published by:</p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Name</strong>: AIT TAYEB Samy</li>
            <li><strong>Email address</strong>: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></li>
            <li><strong>Status</strong>: Individual (not registered with the Trade and Companies Register)</li>
            <li><strong>Publication Director</strong>: AIT TAYEB Samy</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">Website Host</h3>
          <p>The website is hosted by:</p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Lovable.dev</strong></li>
            <li>Web hosting - <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://lovable.dev</a></li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">Intellectual Property</h3>
          <p>
            All content (texts, images, graphics, logos, icons, etc.) of the website is protected by current laws on intellectual property. 
            Any reproduction, representation, modification, or adaptation, in whole or in part, without the express authorization of the publisher is prohibited.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-base sm:text-lg mb-2">Personal Data</h3>
          <p>
            Personal data collected via this website (email address, account information, exchanged messages, etc.) 
            is used solely for the proper functioning of the service.
            This data is not sold or transferred to third parties.
            In accordance with the <strong>General Data Protection Regulation (GDPR)</strong>, you may exercise your rights of access, 
            rectification, or deletion of data by contacting us at: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
