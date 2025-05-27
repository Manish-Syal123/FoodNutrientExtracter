import { Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";

export function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50/30">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
