import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Public
import BrowseServices from "./pages/BrowseServices";
import ServiceDetail from "./pages/ServiceDetail";
import ProviderProfile from "./pages/ProviderProfile";

// Dashboards
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/services" replace /> },

      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // Public — no auth needed
      { path: "services", element: <BrowseServices /> },
      { path: "services/:id", element: <ServiceDetail /> },
      { path: "providers/:userId", element: <ProviderProfile /> },

      // Protected dashboards
      {
        path: "dashboard/customer",
        element: (
          <ProtectedRoute allowedRoles={["customer"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/provider",
        element: (
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/admin",
        element: (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <Navigate to="/services" replace /> },
    ],
  },
]);
