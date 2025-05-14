
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { safeTypeCast } from "@/utils/supabaseHelpers";

const familySchema = z.object({
  name: z.string().min(1, "Family name is required"),
  theme_color: z.string().optional(),
});

const FamilySettings = ({ family }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: family.name,
      theme_color: family.theme_color,
    },
  });

  const updateFamilySettings = async (values) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('families')
        .update(safeTypeCast('families', {
          name: values.name,
          theme_color: values.theme_color
        }))
        .eq('id', family.id);

      if (error) throw error;
      
      toast({
        description: "Family settings updated successfully",
      });
      
      // Optionally, you can invalidate queries or update local state here
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: `Error updating family: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <h2 className="text-2xl font-bold">Family Settings</h2>
        <form onSubmit={form.handleSubmit(updateFamilySettings)} className="space-y-4">
          <Input
            {...form.register("name")}
            placeholder="Family Name"
            className="w-full"
          />
          <Input
            {...form.register("theme_color")}
            placeholder="Theme Color (optional)"
            className="w-full"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Family Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FamilySettings;
