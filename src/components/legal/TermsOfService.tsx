
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText } from "lucide-react";

export function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <FileText className="h-5 w-5" />
          {t('legal.terms_of_service')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 pt-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">1. {t('legal.purpose_title')}</h3>
          <p className="text-muted-foreground">
            {`${t('legal.purpose_desc')} - FamilyCloud (https://family-cloud.mysa-tech.fr)`}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">2. {t('legal.service_access')}</h3>
          <p className="text-muted-foreground">{t('legal.service_access_desc')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.exchanging_messages')}</li>
            <li>{t('legal.sharing_files')}</li>
            <li>{t('legal.managing_data')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">3. {t('legal.account_creation')}</h3>
          <p className="text-muted-foreground">
            {t('legal.account_creation_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">4. {t('legal.user_commitments')}</h3>
          <p className="text-muted-foreground">{t('legal.user_agrees')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.not_share_illegal')}</li>
            <li>{t('legal.respect_members')}</li>
            <li>{t('legal.not_harm')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">5. {t('legal.data_confidentiality')}</h3>
          <p className="text-muted-foreground">
            {t('legal.data_confidentiality_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">6. {t('legal.liability')}</h3>
          <p className="text-muted-foreground">{t('legal.not_responsible')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.service_outages')}</li>
            <li>{t('legal.data_loss')}</li>
            <li>{t('legal.malicious_intrusion')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">7. {t('legal.intellectual_property_title')}</h3>
          <p className="text-muted-foreground">
            {t('legal.intellectual_property_terms')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">8. {t('legal.terms_evolution')}</h3>
          <p className="text-muted-foreground">
            {t('legal.terms_evolution_desc')}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
