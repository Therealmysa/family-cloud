
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import CookieConsent from "./components/cookie/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SetupFamily from "./pages/SetupFamily";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";
import Gallery from "./pages/Gallery";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import FamilyAdmin from "./pages/FamilyAdmin";
import FamilyDashboard from "./pages/FamilyDashboard";
import Legal from "./pages/Legal";
import FamilyMembers from "@/pages/FamilyMembers";
import { useIsMobile } from "./hooks/use-mobile";

// Set up QueryClient with better defaults for real-time apps
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const AppContent = () => {
  const isMobile = useIsMobile();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          {/* Shadcn Toaster - now configured to not render */}
          <Toaster />
          {/* Sonner - now our only toast system for all devices */}
          <Sonner position={isMobile ? "top-center" : "bottom-right"} />
          {/* Cookie Consent Banner */}
          <CookieConsent />
          <Routes>
            {/* Redirect root to language-based routes */}
            <Route path="/" element={<Navigate to="/fr" replace />} />
            
            {/* French Routes */}
            <Route path="/fr" element={<Index />} />
            <Route path="/fr/auth" element={<Auth />} />
            <Route path="/fr/setup-family" element={<SetupFamily />} />
            <Route path="/fr/dashboard" element={<FamilyDashboard />} />
            <Route path="/fr/feed" element={<Feed />} />
            <Route path="/fr/gallery" element={<Gallery />} />
            <Route path="/fr/messages" element={<Messages />} />
            <Route path="/fr/profile" element={<Profile />} />
            <Route path="/fr/create-post" element={<CreatePost />} />
            <Route path="/fr/family-admin" element={<FamilyAdmin />} />
            <Route path="/fr/family-members" element={<FamilyMembers />} />
            <Route path="/fr/legal" element={<Legal />} />
            
            {/* English Routes */}
            <Route path="/en" element={<Index />} />
            <Route path="/en/auth" element={<Auth />} />
            <Route path="/en/setup-family" element={<SetupFamily />} />
            <Route path="/en/dashboard" element={<FamilyDashboard />} />
            <Route path="/en/feed" element={<Feed />} />
            <Route path="/en/gallery" element={<Gallery />} />
            <Route path="/en/messages" element={<Messages />} />
            <Route path="/en/profile" element={<Profile />} />
            <Route path="/en/create-post" element={<CreatePost />} />
            <Route path="/en/family-admin" element={<FamilyAdmin />} />
            <Route path="/en/family-members" element={<FamilyMembers />} />
            <Route path="/en/legal" element={<Legal />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
