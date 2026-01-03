import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/employees" replace />;
  }
  
  return <Navigate to="/auth" replace />;
};

export default Index;
