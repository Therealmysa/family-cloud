
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gavel } from "lucide-react";

export function LegalMentions() {
  const { t } = useLanguage();
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Gavel className="h-5 w-5" />
          {t('legal.notices')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-7 pt-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">{t('legal.publisher')}</h3>
          <p className="text-muted-foreground">{t('legal.publisher_desc')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li><strong>{t('legal.name')}</strong> : AIT TAYEB Samy</li>
            <li><strong>{t('legal.email')}</strong> : <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a></li>
            <li><strong>{t('legal.status')}</strong> : {t('legal.individual')}</li>
            <li><strong>{t('legal.director')}</strong> : AIT TAYEB Samy</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">{t('legal.host')}</h3>
          <p className="text-muted-foreground">{t('legal.host_desc')} :</p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
            <li><strong>Lovable.dev</strong></li>
            <li>{t('legal.web_hosting')} - <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://lovable.dev</a></li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">{t('legal.intellectual_property')}</h3>
          <p className="text-muted-foreground">
            {t('legal.intellectual_property_desc')}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-primary-700 dark:text-primary-400">{t('legal.personal_data')}</h3>
          <p className="text-muted-foreground">
            {t('legal.personal_data_desc')}
            <strong> {t('legal.gdpr')}</strong>, {t('legal.data_rights')} <a href="mailto:pro@mysa-tech.fr" className="text-primary hover:underline">pro@mysa-tech.fr</a>
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
