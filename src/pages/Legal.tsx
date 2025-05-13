
import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

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

      <div className="container mx-auto py-8 px-4 sm:px-6 md:max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Legal Information</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6">
          <Tabs defaultValue="legal" className="w-full">
            <TabsList className={isMobile ? "flex flex-col space-y-3 w-full mb-6" : "grid w-full grid-cols-3 gap-4 mb-6"}>
              <TabsTrigger value="legal" className="py-3 px-4 text-base">Legal Notices</TabsTrigger>
              <TabsTrigger value="privacy" className="py-3 px-4 text-base">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms" className="py-3 px-4 text-base">Terms of Service</TabsTrigger>
            </TabsList>
            
            <Separator className="mb-6" />
            
            <div className="p-2 sm:p-4">
              <TabsContent value="legal" className="mt-4">
                <LegalMentions />
              </TabsContent>
              <TabsContent value="privacy" className="mt-4">
                <PrivacyPolicy />
              </TabsContent>
              <TabsContent value="terms" className="mt-4">
                <TermsOfService />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Legal;
