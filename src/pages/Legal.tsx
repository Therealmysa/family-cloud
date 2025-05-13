
import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

const Legal = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout title="Legal Information">
      <Helmet>
        <title>Legal Information | FamilyCloud</title>
        <meta
          name="description"
          content="Legal information, privacy policy, and terms of service for FamilyCloud."
        />
      </Helmet>

      <div className="container mx-auto py-12 px-4 sm:px-6 md:max-w-4xl">
        <h1 className="text-3xl font-bold mb-10 text-center">Legal Information</h1>

        <Tabs defaultValue="legal" className="w-full">
          <TabsList className={`${isMobile ? 'flex flex-col space-y-2 w-full' : 'grid w-full grid-cols-3 gap-2'}`}>
            <TabsTrigger value="legal" className="py-3">Legal Notices</TabsTrigger>
            <TabsTrigger value="privacy" className="py-3">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms" className="py-3">Terms of Service</TabsTrigger>
          </TabsList>
          <TabsContent value="legal" className="mt-8 p-2">
            <LegalMentions />
          </TabsContent>
          <TabsContent value="privacy" className="mt-8 p-2">
            <PrivacyPolicy />
          </TabsContent>
          <TabsContent value="terms" className="mt-8 p-2">
            <TermsOfService />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Legal;
