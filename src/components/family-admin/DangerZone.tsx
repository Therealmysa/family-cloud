
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash } from "lucide-react";

export function DangerZone() {
  return (
    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 overflow-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
        <CardDescription className="text-red-600/80 dark:text-red-400/80">
          Irreversible actions that affect your entire family
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          <div className="p-3 sm:p-4 border border-red-300 dark:border-red-800 rounded-lg bg-white dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-red-700 dark:text-red-400">Delete Family</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This will permanently delete your family and all associated data.
                </p>
              </div>
              <Button variant="destructive" size="sm" className="self-start sm:self-center">
                <Trash className="h-4 w-4 mr-1" />
                Delete Family
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
