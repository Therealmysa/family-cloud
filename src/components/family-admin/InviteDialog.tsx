
import { useState } from "react";
import { AlertCircle, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string | undefined;
}

export function InviteDialog({ isOpen, onOpenChange, inviteCode }: InviteDialogProps) {
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);

  const copyInviteCode = () => {
    if (!inviteCode) return;
    
    navigator.clipboard.writeText(inviteCode);
    setInviteCodeCopied(true);
    
    setTimeout(() => {
      setInviteCodeCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Family Invite Code</DialogTitle>
          <DialogDescription>
            Share this code with people you want to join your family
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center">
          <h3 className="text-lg sm:text-2xl font-mono tracking-wider font-bold mb-3">
            {inviteCode || "------"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This code can be used to join your family from the setup screen
          </p>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={copyInviteCode}
          >
            {inviteCodeCopied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">For security reasons, do not share this code publicly</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
