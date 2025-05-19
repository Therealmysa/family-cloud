
import { Users } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <h3 className="text-lg font-medium">Your Messages</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-1">
          Select a conversation to start chatting with your family
        </p>
      </div>
    </div>
  );
};
