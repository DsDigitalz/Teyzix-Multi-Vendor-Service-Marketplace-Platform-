import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public home — redirect to register for now
      { index: true, element: <Navigate to="/register" replace /> },

      // Auth pages — no layout chrome needed, handled inside the pages
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Customer routes
      {
        path: 'dashboard/customer',
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        ),
      },

      // Provider routes
      {
        path: 'dashboard/provider',
        element: (
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        ),
      },

      // Admin routes
      {
        path: 'dashboard/admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      // Catch-all
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])