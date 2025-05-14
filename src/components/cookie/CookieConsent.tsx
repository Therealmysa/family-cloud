
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface CookieSettings {
  analytics: boolean;
  necessary: boolean;
}

const defaultSettings: CookieSettings = {
  analytics: false,
  necessary: true // Always required
};

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(defaultSettings);
  
  // Check if consent has already been given
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setOpen(true);
    } else {
      const savedSettings = JSON.parse(consent) as CookieSettings;
      setSettings(savedSettings);
      
      // Initialize Google Analytics if analytics consent was given
      if (savedSettings.analytics) {
        initializeGoogleAnalytics();
      }
    }
  }, []);

  // Function to initialize Google Analytics
  const initializeGoogleAnalytics = () => {
    if (window.gtag) {
      window.gtag('js', new Date());
      window.gtag('config', 'G-3E3KPXCE1X');
    }
  };

  const handleAcceptAll = () => {
    const newSettings = { ...settings, analytics: true };
    setSettings(newSettings);
    localStorage.setItem("cookie-consent", JSON.stringify(newSettings));
    initializeGoogleAnalytics();
    setOpen(false);
    toast.success("All cookies accepted");
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(settings));
    if (settings.analytics) {
      initializeGoogleAnalytics();
    }
    setOpen(false);
    toast.success("Cookie preferences saved");
  };

  const handleRejectAll = () => {
    const newSettings = { ...defaultSettings, analytics: false };
    setSettings(newSettings);
    localStorage.setItem("cookie-consent", JSON.stringify(newSettings));
    setOpen(false);
    toast.success("Only necessary cookies accepted");
  };

  const handleSettingChange = (key: keyof CookieSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReopen = () => {
    setOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Cookie Settings</DialogTitle>
            <DialogDescription>
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
              Please choose which cookies you're willing to allow while using our services.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-start space-x-4 rounded-lg border p-4">
              <Checkbox 
                id="necessary" 
                checked={settings.necessary} 
                disabled={true} 
              />
              <div className="space-y-1">
                <Label htmlFor="necessary" className="font-medium">
                  Necessary Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function properly and cannot be disabled.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 rounded-lg border p-4">
              <Checkbox 
                id="analytics" 
                checked={settings.analytics}
                onCheckedChange={(checked) => handleSettingChange("analytics", checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="analytics" className="font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  These cookies help us analyze how visitors use our website, which allows us to improve it.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
            <Button 
              variant="destructive" 
              onClick={handleRejectAll}
              className="sm:order-1 order-3 w-full sm:w-auto"
            >
              Reject All
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSaveSettings}
              className="sm:order-2 order-2 w-full sm:w-auto"
            >
              Save Preferences
            </Button>
            <Button 
              variant="default" 
              onClick={handleAcceptAll}
              className="sm:order-3 order-1 w-full sm:w-auto"
            >
              Accept All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating button to reopen cookie settings */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleReopen}
          className="shadow-lg flex items-center gap-2"
        >
          <span className="text-xs">Cookie Settings</span>
        </Button>
      </div>
    </>
  );
}
