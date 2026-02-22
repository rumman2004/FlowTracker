import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRoute from "./components/common/AdminRoute.jsx";

// User Pages
import Auth from "./Pages/Auth/Auth.jsx";
import ForgotPassword from "./Pages/User/ForgotPassword.jsx";
import Home from "./Pages/User/Home.jsx";
import Habits from "./Pages/User/Habits.jsx";
import Profile from "./Pages/User/Profile.jsx";
import Settings from "./Pages/User/Settings.jsx";
import Analysis from "./Pages/User/Analysis.jsx";
import LevelUp from "./Pages/User/LevelUp.jsx";

// Admin Pages
import AdminLogin from "./Pages/Admin/AdminLogin.jsx";
import AdminDashboard from "./Pages/Admin/AdminDashboard.jsx";

// Layout
import UserLayout from "./components/Layout/UserLayout.jsx";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        {/* ✅ Fix: Added future flags to suppress React Router v7 warnings */}
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#1f2937",
                borderRadius: "14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login"    element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/level" element={<LevelUp />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;