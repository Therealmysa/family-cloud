import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Legal = () => {
  return <MainLayout title="Legal Information">
      <Helmet>
        <title>Legal Information | FamilyCloud</title>
        <meta name="description" content="Legal information, privacy policy, and terms of service for FamilyCloud." />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Legal Information</h1>

        <Tabs defaultValue="legal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="legal" className="">Legal Notices</TabsTrigger>
            <TabsTrigger value="privacy" className="">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms" className="">Terms of Service</TabsTrigger>
          </TabsList>
          <TabsContent value="legal" className="mt-6">
            <LegalMentions />
          </TabsContent>
          <TabsContent value="privacy" className="mt-6">
            <PrivacyPolicy />
          </TabsContent>
          <TabsContent value="terms" className="mt-6">
            <TermsOfService />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>;
};
export default Legal;