import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

const AdminRoute = () => {
  const { admin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminRoute;