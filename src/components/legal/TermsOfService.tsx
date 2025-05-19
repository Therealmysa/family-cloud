
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">📜</span> {t('legal.terms_of_service')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">1. {t('legal.purpose_title')}</h3>
          <p>
            {/* Fix: Replace object parameter with string interpolation */}
            {`${t('legal.purpose_desc')} - FamilyCloud (https://family-cloud.mysa-tech.fr)`}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">2. {t('legal.service_access')}</h3>
          <p>{t('legal.service_access_desc')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.exchanging_messages')}</li>
            <li>{t('legal.sharing_files')}</li>
            <li>{t('legal.managing_data')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">3. {t('legal.account_creation')}</h3>
          <p>
            {t('legal.account_creation_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">4. {t('legal.user_commitments')}</h3>
          <p>{t('legal.user_agrees')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.not_share_illegal')}</li>
            <li>{t('legal.respect_members')}</li>
            <li>{t('legal.not_harm')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">5. {t('legal.data_confidentiality')}</h3>
          <p>
            {t('legal.data_confidentiality_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">6. {t('legal.liability')}</h3>
          <p>{t('legal.not_responsible')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>{t('legal.service_outages')}</li>
            <li>{t('legal.data_loss')}</li>
            <li>{t('legal.malicious_intrusion')}</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">7. {t('legal.intellectual_property_title')}</h3>
          <p>
            {t('legal.intellectual_property_terms')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">8. {t('legal.terms_evolution')}</h3>
          <p>
            {t('legal.terms_evolution_desc')}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
