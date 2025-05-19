
import MainLayout from "@/components/layout/MainLayout";
import { Helmet } from "react-helmet-async";
import { LegalMentions } from "@/components/legal/LegalMentions";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfService } from "@/components/legal/TermsOfService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";

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
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/60 rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-purple-700 dark:text-purple-400">{t('legal.title')}</h1>
            <p className="text-muted-foreground text-center mt-2 max-w-lg">{t('legal.subtitle')}</p>
          </div>

          <Tabs defaultValue="legal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-4 mb-7">
              <TabsTrigger value="legal" className="py-3 text-base">{t('legal.notices')}</TabsTrigger>
              <TabsTrigger value="privacy" className="py-3 text-base">{t('legal.privacy')}</TabsTrigger>
              <TabsTrigger value="terms" className="py-3 text-base">{t('legal.terms')}</TabsTrigger>
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
