import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import { Media } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";
import { asUpdateType } from "@/utils/supabaseHelpers";
import MediaContent from "./MediaContent";

interface MediaDialogProps {
  media: Media;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaUpdated: () => void;
  onMediaDeleted: () => void;
  familyId?: string | null;
}

export function MediaDialog({
  media,
  open,
  onOpenChange,
  onMediaUpdated,
  onMediaDeleted,
  familyId,
}: MediaDialogProps) {
  const [title, setTitle] = useState(media.title);
  const [description, setDescription] = useState(media.description || "");
  const queryClient = useQueryClient();

  // Mutation for updating media
  const updateMediaMutation = useMutation(
    async (mediaData: { title: string; description: string }) => {
      const { data, error } = await supabase
        .from("media")
        .update(asUpdateType("media", { title: mediaData.title, description: mediaData.description }))
        .eq("id", media.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        toast({
          title: "Media updated",
          description: "The media has been updated successfully.",
        });
        onMediaUpdated(); // Notify parent to refresh data
      },
      onError: (error: any) => {
        toast({
          title: "Error updating media",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(["gallery", familyId]);
      },
    }
  );

  // Mutation for deleting media
  const deleteMediaMutation = useMutation(
    async () => {
      const { error } = await supabase.from("media").delete().eq("id", media.id);

      if (error) {
        throw error;
      }
    },
    {
      onSuccess: () => {
        toast({
          title: "Media deleted",
          description: "The media has been deleted successfully.",
        });
        onMediaDeleted(); // Notify parent to refresh data
        onOpenChange(false); // Close the dialog
      },
      onError: (error: any) => {
        toast({
          title: "Error deleting media",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(["gallery", familyId]);
      },
    }
  );

  const handleUpdateMedia = async () => {
    updateMediaMutation.mutate({ title, description });
  };

  const handleDeleteMedia = async () => {
    deleteMediaMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media Details</DialogTitle>
          <DialogDescription>
            View and manage details about this media. Make changes here.
          </DialogDescription>
        </DialogHeader>

        <MediaContent media={media} />

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uploaded" className="text-right">
              Uploaded
            </Label>
            <p className="col-span-3">
              {media.date_uploaded
                ? format(new Date(media.date_uploaded), "PPP")
                : "Unknown"}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                media from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMedia}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button type="submit" onClick={handleUpdateMedia}>
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
