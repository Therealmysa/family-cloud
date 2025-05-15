
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "@/components/ui/use-toast";
import { MediaUploader } from "@/components/gallery/MediaUploader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreatePost = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || !profile) return;
    
    if (!profile.family_id) {
      toast({
        title: "No Family Found",
        description: "You need to be part of a family to share posts.",
        variant: "destructive",
      });
      navigate('/setup-family');
    }
  }, [user, profile, navigate]);

  const handleSuccess = () => {
    navigate('/gallery');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!user || !profile || !profile.family_id) {
    return (
      <MainLayout title="Create Post" requireAuth={true}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Create Post" requireAuth={true}>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <MediaUploader
          userId={user.id}
          familyId={profile.family_id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
};

export default CreatePost;
