
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronRight, Heart, Lock, Shield, Smile, Users, 
  Check, Camera, Award, Clock, FileText, ThumbsUp, 
  Zap, Globe, Smartphone, Laptop, Tablet 
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();

  // Redirect authenticated users to the dashboard
  useEffect(() => {
    if (user) {
      if (!profile?.family_id) {
        navigate(`/${locale}/setup-family`);
      } else {
        navigate(`/${locale}/dashboard`);
      }
    }
  }, [user, profile, navigate, locale]);

  return (
    <MainLayout title={t('nav.home')}>
      <Helmet>
        <title>{`FamilyCloud - ${locale === 'fr' ? 'Plateforme de partage familial privé | Application sécurisée de partage de photos' : 'Private Family Sharing Platform | Secure Photo Sharing App'}`}</title>
        <meta 
          name="description" 
          content={locale === 'fr' 
            ? "FamilyCloud fournit un espace numérique sécurisé et privé pour les familles qui souhaitent partager leur vie entre elles, échanger en privé et créer de belles galeries de souvenirs. Essayez notre plateforme familiale aujourd'hui."
            : "FamilyCloud provides a secure and private digital space for families to share photos, chat privately, and create beautiful galleries of memories. Try our family-friendly sharing platform today."
          } 
        />
        <meta name="keywords" content={locale === 'fr' ? "partage familial, photos privées, messagerie sécurisée, moments familiaux, album de famille numérique, application de partage familial, stockage de photos privé, chat familial" : "family sharing, private photos, secure messaging, family moments, digital family album, family sharing app, private photo storage, family chat"} />
        <link rel="canonical" href="https://mysa-tech.fr" />
      </Helmet>

      <div className="flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl my-6 md:my-8">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter xl:text-6xl text-purple-700 dark:text-purple-400">
                    {t('landing.hero.title')}
                  </h1>
                  <p className="max-w-[600px] text-gray-600 dark:text-gray-300 text-base md:text-lg lg:text-xl">
                    {t('landing.hero.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {!user && (
                    <>
                      <Button asChild size="lg" className="px-8">
                        <Link to={`/${locale}/auth?signup=true`}>{t('landing.hero.get_started')} <ChevronRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                      <Button asChild variant="outlined" size="lg">
                        <Link to={`/${locale}/auth`}>{t('landing.hero.sign_in')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[450px] aspect-square">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-200/50 dark:bg-purple-900/30 animate-float delay-200" style={{ animationDuration: '5s' }}></div>
                  <div className="absolute top-[20%] left-[15%] w-[70%] h-[70%] rounded-full bg-purple-300/60 dark:bg-purple-800/40 animate-float" style={{ animationDuration: '7s' }}></div>
                  <div className="absolute top-[30%] left-[25%] w-[50%] h-[50%] rounded-full bg-purple-400/70 dark:bg-purple-700/50 animate-float delay-500" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-800 p-8 shadow-lg">
                        <Heart size={80} className="text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is FamilyCloud - New section for SEO */}
        <section className="w-full py-10 md:py-14 lg:py-16" id="about" aria-labelledby="about-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 id="about-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {t('landing.about.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-[800px] mx-auto mb-6">
                {t('landing.about.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <Shield className="h-10 w-10 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.private')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('landing.features.private_desc')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <Users className="h-10 w-10 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.focused')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('landing.features.focused_desc')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <Heart className="h-10 w-10 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.memory')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('landing.features.memory_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-10 md:py-14 lg:py-16 bg-gradient-to-br from-purple-50/80 to-white dark:from-gray-900/80 dark:to-gray-800/80 rounded-2xl" id="features" aria-labelledby="features-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 id="features-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {t('landing.features.title')}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                {t('landing.features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Smile className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.moments')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('landing.features.moments_desc')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.messaging')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('landing.features.messaging_desc')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-purple-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                    <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('landing.features.gallery')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('landing.features.gallery_desc')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-10 md:py-14 lg:py-16" id="how-it-works" aria-labelledby="how-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 id="how-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {locale === 'fr' ? 'Comment fonctionne FamilyCloud' : 'How FamilyCloud Works'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                {locale === 'fr' ? 'Commencez à partager des moments significatifs avec votre famille en trois étapes simples' : 'Start sharing meaningful moments with your family in three simple steps'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 relative">
                  <div className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">1</div>
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{locale === 'fr' ? 'Créez votre famille' : 'Create Your Family'}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' ? 'Inscrivez-vous et créez votre espace familial privé avec un code d\'invitation unique' : 'Sign up and create your private family space with a unique invitation code'}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 relative">
                  <div className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">2</div>
                  <Camera className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{locale === 'fr' ? 'Partagez des moments' : 'Share Moments'}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' ? 'Publiez des temps forts quotidiens, des photos et des mises à jour pour votre famille' : 'Post daily highlights, photos, and updates for your family to enjoy'}
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4 relative">
                  <div className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">3</div>
                  <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{locale === 'fr' ? 'Restez connectés' : 'Stay Connected'}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' ? 'Discutez en privé, réagissez aux publications et créez une collection de souvenirs familiaux numériques' : 'Chat privately, react to posts, and build a digital family memory collection'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="w-full py-10 md:py-14 lg:py-16 bg-gradient-to-br from-purple-50/80 to-white dark:from-gray-900/80 dark:to-gray-800/80 rounded-2xl" id="benefits" aria-labelledby="benefits-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 id="benefits-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {locale === 'fr' ? 'Pourquoi les familles choisissent FamilyCloud' : 'Why Families Choose FamilyCloud'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                {locale === 'fr' ? 'Rejoignez des milliers de familles qui font confiance à FamilyCloud pour leurs besoins de partage privé' : 'Join thousands of families who trust FamilyCloud for their private sharing needs'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{locale === 'fr' ? 'Confidentialité complète' : 'Complete Privacy'}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{locale === 'fr' ? 'Vos moments familiaux restent privés - pas de partage de données, pas de publicités ciblées' : 'Your family moments stay private - no data sharing, no targeted ads'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{locale === 'fr' ? 'Facile à utiliser' : 'Easy to Use'}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{locale === 'fr' ? 'Interface intuitive conçue pour les membres de la famille de tous âges' : 'Intuitive interface designed for family members of all ages'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{locale === 'fr' ? 'Fonctionne partout' : 'Works Everywhere'}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{locale === 'fr' ? 'Accessible depuis n\'importe quel appareil - mobile, tablette ou ordinateur' : 'Access from any device - mobile, tablet, or computer'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{locale === 'fr' ? 'Gratuit à utiliser' : 'Free to Use'}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{locale === 'fr' ? 'Pas d\'abonnement requis - connectez-vous avec votre famille sans frais' : 'No subscription required - connect with your family at no cost'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="w-full py-10 md:py-14 lg:py-16" id="use-cases" aria-labelledby="use-cases-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-8">
              <h2 id="use-cases-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {locale === 'fr' ? 'Parfait pour toutes les situations familiales' : 'Perfect for All Family Situations'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto mb-8">
                {locale === 'fr' ? 'FamilyCloud s\'adapte aux besoins et circonstances uniques de votre famille' : 'FamilyCloud adapts to your family\'s unique needs and circumstances'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                  <Globe className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{locale === 'fr' ? 'Familles à distance' : 'Long-Distance Families'}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {locale === 'fr' ? 'Restez connectés avec vos proches à travers différents pays et fuseaux horaires' : 'Stay connected with loved ones across different countries and time zones'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                  <Clock className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{locale === 'fr' ? 'Parents occupés' : 'Busy Parents'}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {locale === 'fr' ? 'Des mises à jour quotidiennes rapides permettent à tous de rester connectés malgré des emplois du temps chargés' : 'Quick daily updates keep everyone connected despite hectic schedules'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                  <Award className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{locale === 'fr' ? 'Grands-parents' : 'Grandparents'}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {locale === 'fr' ? 'L\'interface simple permet de suivre facilement les étapes importantes de vos petits-enfants' : 'Simple interface makes it easy to stay updated on grandchildren\'s milestones'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                  <FileText className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{locale === 'fr' ? 'Historiens familiaux' : 'Family Historians'}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {locale === 'fr' ? 'Créez une archive numérique durable des moments précieux de votre famille' : 'Create a lasting digital archive of your family\'s precious moments'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="w-full py-10 md:py-14 lg:py-16 bg-gradient-to-br from-purple-50/80 to-white dark:from-gray-900/80 dark:to-gray-800/80 rounded-2xl" id="technology" aria-labelledby="tech-heading">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 id="tech-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                  {locale === 'fr' ? 'Conçu avec une technologie axée sur la confidentialité' : 'Built with Privacy-First Technology'}
                </h2>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {locale === 'fr' 
                    ? 'FamilyCloud est conçu de A à Z avec la sécurité et la confidentialité comme priorités absolues. Nous utilisons des pratiques de chiffrement et de sécurité de pointe pour garantir que vos données familiales restent privées.'
                    : 'FamilyCloud is designed from the ground up with security and privacy as our top priorities. We use industry-leading encryption and security practices to ensure your family data remains private.'}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Chiffrement de bout en bout' : 'End-to-End Encryption'}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{locale === 'fr' ? 'Tous les messages et médias sont chiffrés pour protéger votre vie privée' : 'All messages and media are encrypted to protect your privacy'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Accès réservé à la famille' : 'Family-Only Access'}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{locale === 'fr' ? 'Seuls les membres de la famille invités peuvent accéder à votre espace privé' : 'Only invited family members can access your private space'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Rapide et fiable' : 'Fast & Reliable'}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{locale === 'fr' ? 'Construit sur une infrastructure cloud moderne pour un accès rapide à tout moment' : 'Built on modern cloud infrastructure for quick access anytime'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[400px]">
                  <AspectRatio ratio={4/3} className="bg-muted rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 flex flex-col items-center justify-center">
                        <Shield className="h-16 w-16 text-purple-600 dark:text-purple-400 mb-4" />
                        <div className="text-center space-y-1">
                          <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{locale === 'fr' ? 'Votre Famille' : 'Your Family'}</p>
                          <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{locale === 'fr' ? 'Votre Vie Privée' : 'Your Privacy'}</p>
                          <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{locale === 'fr' ? 'Notre Promesse' : 'Our Promise'}</p>
                        </div>
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cross Platform */}
        <section className="w-full py-10 md:py-14 lg:py-16" id="platforms" aria-labelledby="platforms-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 id="platforms-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {locale === 'fr' ? 'Disponible sur tous vos appareils' : 'Available on All Your Devices'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                {locale === 'fr' ? 'Accédez à FamilyCloud où que vous soyez, sur n\'importe quel appareil' : 'Access FamilyCloud wherever you are, on any device'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-gray-800 p-4 rounded-xl mb-3">
                  <Smartphone className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Mobile' : 'Mobile'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">iOS & Android</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-gray-800 p-4 rounded-xl mb-3">
                  <Laptop className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Ordinateur' : 'Desktop'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Mac & Windows</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-gray-800 p-4 rounded-xl mb-3">
                  <Tablet className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Tablette' : 'Tablet'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">iPad & Android</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-gray-800 p-4 rounded-xl mb-3">
                  <Globe className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold">{locale === 'fr' ? 'Navigateur Web' : 'Web Browser'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{locale === 'fr' ? 'Chrome, Safari, Firefox' : 'Chrome, Safari, Firefox'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="w-full py-10 md:py-14 lg:py-16 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl my-6 md:my-8" id="trust" aria-labelledby="trust-heading">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-lg bg-purple-100 dark:bg-gray-800">
                  <Shield className="h-10 w-10 text-purple-700 dark:text-purple-400" />
                </div>
                <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                  {locale === 'fr' ? 'Sûr, privé et familial' : 'Safe, Private, and Family-Friendly'}
                </h2>
                <p className="max-w-[700px] text-gray-600 dark:text-gray-300 text-base md:text-lg lg:text-base/relaxed xl:text-lg/relaxed">
                  {locale === 'fr' 
                    ? 'Les souvenirs de votre famille restent au sein de votre famille. Pas de publicités, pas de partage de données, juste un espace sécurisé pour vos proches.'
                    : 'Your family\'s memories stay within your family. No ads, no data sharing, just a secure space for your loved ones.'}
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Button asChild size="lg" className="w-full">
                  <Link to={`/${locale}/auth?signup=true`}>
                    {locale === 'fr' ? 'Rejoignez FamilyCloud aujourd\'hui' : 'Join FamilyCloud Today'}
                  </Link>
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {locale === 'fr' 
                    ? 'Créez l\'espace privé de votre famille en moins d\'une minute'
                    : 'Create your family\'s private space in less than a minute'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-10 md:py-14 lg:py-16" id="faq" aria-labelledby="faq-heading">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-400 mb-4">
                {locale === 'fr' ? 'Questions fréquemment posées' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-[700px] mx-auto">
                {locale === 'fr' ? 'Trouvez des réponses aux questions courantes sur FamilyCloud' : 'Find answers to common questions about FamilyCloud'}
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'fr' ? 'FamilyCloud est-il vraiment gratuit ?' : 'Is FamilyCloud really free to use?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' 
                    ? 'Oui ! FamilyCloud est complètement gratuit pour toutes les fonctionnalités de base. Nous croyons que chaque famille mérite un espace privé pour se connecter et partager des souvenirs sans barrières financières.'
                    : 'Yes! FamilyCloud is completely free for all basic features. We believe that every family deserves a private space to connect and share memories without financial barriers.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'fr' ? 'Combien de membres de la famille puis-je inviter ?' : 'How many family members can I invite?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' 
                    ? 'Il n\'y a pas de limite au nombre de membres de la famille que vous pouvez inviter dans votre espace familial privé. De la famille immédiate aux parents éloignés, tout le monde peut rejoindre.'
                    : 'There\'s no limit to the number of family members you can invite to your private family space. From immediate family to extended relatives, everyone can join.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'fr' ? 'Mes données sont-elles vraiment privées ?' : 'Is my data really private?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' 
                    ? 'Absolument. FamilyCloud est construit avec la confidentialité comme principe fondamental. Vos photos, messages et données ne sont accessibles qu\'aux membres de votre famille. Nous ne vendons pas de données et ne les utilisons pas pour de la publicité ciblée.'
                    : 'Absolutely. FamilyCloud is built with privacy as the core principle. Your photos, messages, and data are only accessible to your family members. We do not sell data or use it for targeted advertising.'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">
                  {locale === 'fr' ? 'En quoi FamilyCloud est-il différent des réseaux sociaux ?' : 'How is FamilyCloud different from social media?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {locale === 'fr' 
                    ? 'Contrairement aux plateformes de médias sociaux où votre contenu est public ou semi-public, FamilyCloud est complètement privé pour votre famille uniquement. Il n\'y a pas d\'algorithmes qui décident ce que vous voyez, pas de publicités et pas d\'extraction de données.'
                    : 'Unlike social media platforms where your content is public or semi-public, FamilyCloud is completely private to just your family. There are no algorithms deciding what you see, no advertisements, and no data mining.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
