
import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Shield, Gavel } from "lucide-react";

const Legal = () => {
  const { t } = useLanguage();
  
  return <MainLayout title={t('nav.legal')}>
      <Helmet>
        <title>{t('nav.legal')} | FamilyCloud</title>
        <meta name="description" content={t('legal.meta_description')} />
        <meta name="keywords" content="privacy policy, terms of service, legal information, family sharing app, data protection, user agreement" />
        <link rel="canonical" href="https://mysa-tech.fr/legal" />
      </Helmet>

      <div className="container mx-auto py-9 px-4">
        <div className="max-w-4xl mx-auto bg-card dark:bg-gray-800/60 rounded-xl shadow-md p-6 md:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 dark:bg-primary-900/30 rounded-full mb-4">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-primary">{t('legal.title')}</h1>
            <p className="text-muted-foreground text-center mt-3 max-w-lg">{t('legal.subtitle')}</p>
          </div>

          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/40">
              <TabsTrigger 
                value="legal" 
                className="py-3 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  <span>{t('legal.notices')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="py-3 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{t('legal.privacy')}</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="terms" 
                className="py-3 text-base data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-md"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{t('legal.terms')}</span>
                </div>
              </TabsTrigger>
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
