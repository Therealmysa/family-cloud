
// This is a simple re-export of the useAuthContext hook from AuthContext.tsx
// This maintains backward compatibility with all components that import from '@/hooks/useAuth'
import { useAuthContext } from "@/contexts/AuthContext";

// Re-export the useAuthContext hook as useAuth for backward compatibility
export const useAuth = useAuthContext;

// Export default for components that use default import
export default useAuth;

// Extending the AuthContextType (this will be used by TypeScript)
declare module "@/contexts/AuthContext" {
  interface AuthContextType {
    refreshProfile?: () => Promise<void>;
  }
}
