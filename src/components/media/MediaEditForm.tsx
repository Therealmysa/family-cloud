import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Media } from "@/types/media";

type MediaFormValues = {
  title: string;
  description: string;
  file: FileList;
};

interface MediaEditFormProps {
  media: Media;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MediaEditForm: React.FC<MediaEditFormProps> = ({ media, onSuccess, onCancel }) => {
  const { register, handleSubmit, setValue } = useForm<MediaFormValues>({
    defaultValues: {
      title: media.title,
      description: media.description,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setValue("file", event.target.files);
    }
  };

  const handleSubmitForm = async (values: MediaFormValues) => {
    setIsSubmitting(true);
    try {
      const { title, description, file } = values;

      // Upload file to Supabase Storage
      if (file && file.length > 0) {
        const fileName = `${media.id}-${file[0].name}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, file[0]);

        if (uploadError) {
          throw uploadError;
        }
      }

      // Update media record in the database
      const { error: updateError } = await supabase
        .from("media")
        .update({ title, description })
        .eq("id", media.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Media updated",
        description: "Your media has been successfully updated.",
        variant: "success",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating media:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: true })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Upload File
        </label>
        <input
          id="file"
          type="file"
          onChange={handleFileChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Updating..." : "Update Media"}
        </button>
      </div>
    </form>
  );
};
