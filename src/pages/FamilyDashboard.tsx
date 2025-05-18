
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageSquare, Image, Calendar, Users, Cloud, Heart, Share } from "lucide-react";
import { LastMessageWidget } from "@/components/dashboard/LastMessageWidget";
import { LastPictureWidget } from "@/components/dashboard/LastPictureWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

const FamilyDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t, locale } = useLanguage();
  
  // Redirect to setup family if user doesn't have a family yet
  useEffect(() => {
    if (!loading && user && !profile?.family_id) {
      navigate(`/${locale}/setup-family`);
    }
  }, [user, profile, loading, navigate, locale]);

  // If user is not authenticated, redirect to home page
  useEffect(() => {
    if (!loading && !user) {
      navigate(`/${locale}/`);
    }
  }, [user, loading, navigate, locale]);
  
  if (loading) return null;

  const welcomeMessage = profile?.name 
    ? t('dashboard.welcome_name').replace('{name}', profile.name) 
    : t('dashboard.welcome');

  return (
    <MainLayout title={t('nav.dashboard')} requireAuth={true}>
      <div className="w-full">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/20 mb-5">
            <Heart className="h-9 w-9 text-primary animate-float" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {welcomeMessage}
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-md mx-auto">
            {t('dashboard.private_space')}
          </p>
        </div>
        
        {/* Activity Highlights Section */}
        <div className="mb-8 md:mb-14 bg-gradient-to-br from-background to-muted p-4 md:p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl md:text-2xl font-semibold mb-5 flex items-center gap-2">
            <Cloud className="h-6 w-6 text-secondary" />
            <span>{t('dashboard.recent_activity')}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <LastMessageWidget />
            <LastPictureWidget />
          </div>
        </div>
        
        {/* Quick Access Section */}
        <div className="mb-8 md:mb-14">
          <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
            <Share className="h-6 w-6 text-secondary" />
            <span>{t('dashboard.quick_access')}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <span>{t('nav.messages')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  {t('dashboard.messages_desc')}
                </p>
                <Button 
                  asChild 
                  variant="primary" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to={`/${locale}/messages`}>{t('dashboard.open_messages')}</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Image className="h-5 w-5 text-secondary" />
                  </div>
                  <span>{t('nav.gallery')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  {t('dashboard.gallery_desc')}
                </p>
                <Button 
                  asChild 
                  variant="secondary" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to={`/${locale}/gallery`}>{t('dashboard.view_gallery')}</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-accent/10">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <span>{t('nav.feed')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                  {t('dashboard.feed_desc')}
                </p>
                <Button 
                  asChild 
                  variant="accent" 
                  className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                >
                  <Link to={`/${locale}/feed`}>{t('dashboard.go_feed')}</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-800/80 overflow-hidden group">
              <CardHeader className="pb-2 relative">
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/5 dark:bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span>{t('nav.family_members')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {profile?.is_admin ? (
                  <>
                    <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                      {t('dashboard.family_desc')}
                    </p>
                    <Button 
                      asChild 
                      variant="outlined" 
                      className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                    >
                      <Link to={`/${locale}/family-admin`}>{t('dashboard.family_admin')}</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-base text-muted-foreground mb-5 line-clamp-2">
                      {t('dashboard.profile_desc')}
                    </p>
                    <Button 
                      asChild 
                      variant="outlined" 
                      className={`w-full text-base font-medium ${isMobile ? 'py-5' : ''}`}
                    >
                      <Link to={`/${locale}/profile`}>{t('dashboard.my_profile')}</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Create Post/Share Moment button */}
        <div className="mb-8 text-center">
          <Button 
            asChild 
            size={isMobile ? "xl" : "xl"} 
            variant="primary"
            className="rounded-full px-6 md:px-8 py-6 md:py-7 shadow-md hover:shadow-lg text-lg font-medium"
          >
            <Link to={`/${locale}/create-post`} className="flex items-center gap-2">
              <Heart className="h-6 w-6" />
              <span>{t('dashboard.share_moment')}</span>
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default FamilyDashboard;
