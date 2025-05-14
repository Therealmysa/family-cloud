import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ColorPicker } from "@/components/ui/color-picker"
import { supabase } from "@/integrations/supabase/client"
import { asFamilyUpdate } from "@/utils/supabaseHelpers"

const familySettingsSchema = z.object({
  familyName: z.string().min(2, {
    message: "Family name must be at least 2 characters.",
  }),
  primaryColor: z.string().optional(),
})

export function FamilySettings() {
  const { toast } = useToast()
  const { profile, family } = useAuth()

  const form = useForm<z.infer<typeof familySettingsSchema>>({
    resolver: zodResolver(familySettingsSchema),
    defaultValues: {
      familyName: family?.name || "",
      primaryColor: family?.theme_color || "#000000",
    },
  })

  useEffect(() => {
    if (family) {
      form.reset({
        familyName: family.name || "",
        primaryColor: family.theme_color || "#000000",
      })
    }
  }, [family, form])

  const handleSubmit = async (values: z.infer<typeof familySettingsSchema>) => {
    if (!profile?.family_id) {
      toast({
        title: "Not a member of a family",
        description: "You must be a member of a family to change settings.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('families')
        .update(asFamilyUpdate({
          name: values.familyName,
          theme_color: values.primaryColor
        }))
        .eq('id', family.id);
        
      if (error) {
        toast({
          title: "Error updating family settings",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Family settings updated successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to update family settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="familyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family name</FormLabel>
              <FormControl>
                <Input placeholder="Family name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update family settings</Button>
      </form>
    </Form>
  )
}
