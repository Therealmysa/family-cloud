import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";

const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  media: z.any().refine((v) => v?.length === 1, "A file is required"),
});

type PostFormValues = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  userId: string;
  familyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreatePostForm = ({
  userId,
  familyId,
  onSuccess,
  onCancel,
}: CreatePostFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", description: "", media: null },
  });

  const onMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    form.setValue("media", e.target.files);
  };

  const resetForm = () => {
    form.reset();
    previewUrl && URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    onCancel();
  };

  const onSubmit = async (values: PostFormValues) => {
    if (!userId || !familyId || !file) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `${userId}-${Date.now()}.${ext}`;
      const path = `media/${filename}`;

      // Upload
      const { error: upErr } = await supabase.storage
        .from("family-media")
        .upload(path, file, { contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;

      // Signed URL
      const { data: sd, error: se } = await supabase.storage
        .from("family-media")
        .createSignedUrl(path, 3600);
      if (se || !sd?.signedUrl) throw se ?? new Error("No URL");
      const publicUrl = sd.signedUrl;

      // Thumbnail
      const isVideo = file.type.startsWith("video/");
      const thumb = isVideo ? `${publicUrl}#t=0.1` : null;

      // Date
      const dateUp = new Date().toISOString().split("T")[0];

      // Insert in DB
      const { error: me } = await supabase
        .from("media")
        .insert({
          title: values.title,
          description: values.description || null,
          url: publicUrl,
          user_id: userId,
          family_id: familyId,
          thumbnail_url: thumb,
          date_uploaded: dateUp,
        });
      if (me) throw me;

      toast({ title: "Success!", description: "Shared with family." });
      resetForm();
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Share a Memory</h2>
        <Button variant="ghost" size="sm" onClick={resetForm} className="flex items-center gap-2">
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input {...field} placeholder="My special moment" /></FormControl>
                  <FormMessage/>
                </FormItem>
              )}/>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea {...field} rows={3} className="resize-none"/></FormControl>
                  <FormMessage/>
                </FormItem>
              )}/>

              <FormField control={form.control} name="media" render={() => (
                <FormItem>
                  <FormLabel>Media (Image or Video)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg"
                      onChange={onMediaChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </FormControl>
                  {/* Preview hors de FormControl */}
                  {previewUrl && (
                    <div className="mt-4 max-w-full overflow-hidden rounded-lg">
                      {file?.type.startsWith("video/") ? (
                        <video src={previewUrl} controls className="w-full max-h-[600px] object-contain" />
                      ) : (
                        <img src={previewUrl} alt="Preview" className="w-full max-h-[600px] object-contain" />
                      )}
                    </div>
                  )}
                  <FormMessage/>
                </FormItem>
              )}/>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4"/> Share with Family</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
