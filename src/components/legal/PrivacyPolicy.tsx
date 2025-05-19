
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield } from "lucide-react";

export function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Shield className="h-5 w-5" />
          {t('legal.privacy_policy')} (GDPR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 pt-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">1. {t('legal.data_controller')}</h3>
          <p className="text-muted-foreground">{t('legal.controller_is')} :</p>
          <p className="text-muted-foreground mt-2"><strong>AIT TAYEB Samy</strong><br />
          {t('legal.contact_email')}: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">2. {t('legal.data_collected')}</h3>
          <p className="text-muted-foreground">{t('legal.data_collected_desc')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.login_credentials')}</li>
            <li>{t('legal.message_data')}</li>
            <li>{t('legal.ip_address')}</li>
            <li>{t('legal.browsing_data')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">3. {t('legal.purpose')}</h3>
          <p className="text-muted-foreground">{t('legal.data_used')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.enable_access')}</li>
            <li>{t('legal.facilitate_communication')}</li>
            <li>{t('legal.ensure_security')}</li>
            <li>{t('legal.improve_experience')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">4. {t('legal.storage_security')}</h3>
          <p className="text-muted-foreground">
            {`${t('legal.storage_desc')} (Lovable.dev)`}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">5. {t('legal.retention')}</h3>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.account_data')}</li>
            <li>{t('legal.messages_files')}</li>
            <li>{t('legal.cookies')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">6. {t('legal.your_rights')}</h3>
          <p className="text-muted-foreground">{t('legal.gdpr_rights')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li>{t('legal.access_data')}</li>
            <li>{t('legal.correct_delete')}</li>
            <li>{t('legal.object_processing')}</li>
            <li>{t('legal.request_portability')}</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            {t('legal.exercise_rights')} : <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
