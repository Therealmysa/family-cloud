import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
const Legal = () => {
  return <MainLayout title="Legal Information">
      <Helmet>
        <title>Legal Information | Privacy Policy | Terms of Service | FamilyCloud</title>
        <meta name="description" content="Important legal information about FamilyCloud including privacy policy, terms of service, and legal notices for our secure family sharing platform." />
        <meta name="keywords" content="privacy policy, terms of service, legal information, family sharing app, data protection, user agreement" />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/60 rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-purple-700 dark:text-purple-400">Legal Information</h1>

          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-3 mb-6">
              <TabsTrigger value="legal" className="py-3 text-base">Legal Notices</TabsTrigger>
              <TabsTrigger value="privacy" className="py-3 text-base">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms" className="py-3 text-base">Terms of Service</TabsTrigger>
            </TabsList>
            <Separator className="mb-6" />
            <TabsContent value="legal" className="mt-4">
              <LegalMentions />
            </TabsContent>
            <TabsContent value="privacy" className="mt-4">
              <PrivacyPolicy />
            </TabsContent>
            <TabsContent value="terms" className="mt-4">
              <TermsOfService />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>;
};
export default Legal;