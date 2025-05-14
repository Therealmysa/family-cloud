
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
      <TooltipProvider>
        {/* Shadcn Toaster - now configured to not render */}
        <Toaster />
        {/* Sonner - now our only toast system for all devices */}
        <Sonner position={isMobile ? "top-center" : "bottom-right"} />
        {/* Cookie Consent Banner */}
        <CookieConsent />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup-family" element={<SetupFamily />} />
            <Route path="/dashboard" element={<FamilyDashboard />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/family-admin" element={<FamilyAdmin />} />
            <Route path="/legal" element={<Legal />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
