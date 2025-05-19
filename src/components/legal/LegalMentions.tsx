
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function LegalMentions() {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('legal.notices')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">{t('legal.publisher')}</h3>
          <p>{t('legal.publisher_desc')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>{t('legal.name')}</strong>: AIT TAYEB Samy</li>
            <li><strong>{t('legal.email')}</strong>: <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></li>
            <li><strong>{t('legal.status')}</strong>: {t('legal.individual')}</li>
            <li><strong>{t('legal.director')}</strong>: AIT TAYEB Samy</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">{t('legal.host')}</h3>
          <p>{t('legal.host_desc')}:</p>
          <ul className="list-disc pl-6 mt-2">
            <li><strong>Lovable.dev</strong></li>
            <li>{t('legal.web_hosting')} - <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://lovable.dev</a></li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">{t('legal.intellectual_property')}</h3>
          <p>
            {t('legal.intellectual_property_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">{t('legal.personal_data')}</h3>
          <p>
            {t('legal.personal_data_desc')}
            <strong>{t('legal.gdpr')}</strong>, {t('legal.data_rights')}
            <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
