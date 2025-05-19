
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">🔒</span> {t('legal.privacy_policy')} (GDPR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">1. {t('legal.data_controller')}</h3>
          <p>{t('legal.controller_is')}:</p>
          <p><strong>AIT TAYEB Samy</strong><br />
          {t('legal.contact_email')}: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">2. {t('legal.data_collected')}</h3>
          <p>{t('legal.data_collected_desc')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.login_credentials')}</li>
            <li>{t('legal.message_data')}</li>
            <li>{t('legal.ip_address')}</li>
            <li>{t('legal.browsing_data')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">3. {t('legal.purpose')}</h3>
          <p>{t('legal.data_used')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.enable_access')}</li>
            <li>{t('legal.facilitate_communication')}</li>
            <li>{t('legal.ensure_security')}</li>
            <li>{t('legal.improve_experience')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">4. {t('legal.storage_security')}</h3>
          <p>
            {t('legal.storage_desc', { host: 'Lovable.dev' })}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">5. {t('legal.retention')}</h3>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.account_data')}</li>
            <li>{t('legal.messages_files')}</li>
            <li>{t('legal.cookies')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">6. {t('legal.your_rights')}</h3>
          <p>{t('legal.gdpr_rights')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.access_data')}</li>
            <li>{t('legal.correct_delete')}</li>
            <li>{t('legal.object_processing')}</li>
            <li>{t('legal.request_portability')}</li>
          </ul>
          <p className="mt-2">
            {t('legal.exercise_rights')}: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
