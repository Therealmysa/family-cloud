
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useLanguage();

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Check URL query params for signup
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("signup") === "true") {
      setActiveTab("sign-up");
    }
  }, [location]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${locale}/`);
    }
  }, [user, navigate, locale]);

  const handleSignIn = async (data: SignInFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password, data.name);
      signUpForm.reset();
      setActiveTab("sign-in");
    } catch (error) {
      console.error("Error signing up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      forgotPasswordForm.reset();
      setActiveTab("sign-in");
    } catch (error) {
      console.error("Error requesting password reset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout title={activeTab === "sign-up" ? t('auth.sign_up') : t('auth.sign_in')}>
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('auth.welcome')}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "sign-up" 
                ? t('auth.create_account') 
                : activeTab === "forgot-password"
                ? t('auth.reset_email')
                : t('auth.sign_in_account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="sign-in">{t('auth.sign_in')}</TabsTrigger>
                <TabsTrigger value="sign-up">{t('auth.sign_up')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign-in">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="name@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>{t('auth.password')}</FormLabel>
                            <Button 
                              type="button" 
                              variant="link" 
                              className="p-0 text-xs"
                              onClick={() => setActiveTab("forgot-password")}
                            >
                              {t('auth.forgot_password')}
                            </Button>
                          </div>
                          <FormControl>
                            <Input 
                              placeholder="********" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('auth.signing_in')}
                        </div>
                      ) : (
                        t('auth.sign_in')
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="sign-up">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.full_name')}</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="name@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.password')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="********" 
                              type="password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('auth.creating_account')}
                        </div>
                      ) : (
                        t('auth.create_account_button')
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="forgot-password">
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('auth.email')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="name@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('auth.sending_reset')}
                        </div>
                      ) : (
                        t('auth.reset_email_button')
                      )}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="link" 
                      className="w-full mt-2"
                      onClick={() => setActiveTab("sign-in")}
                    >
                      {t('auth.back_to_sign_in')}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-500 text-center">
              {activeTab === "sign-in" ? (
                <p>{t('auth.dont_have_account')} <Button variant="link" className="p-0" onClick={() => setActiveTab("sign-up")}>{t('auth.sign_up')}</Button></p>
              ) : (
                <p>{t('auth.already_have_account')} <Button variant="link" className="p-0" onClick={() => setActiveTab("sign-in")}>{t('auth.sign_in')}</Button></p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
