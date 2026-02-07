import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ClientLayout } from './components/layout/ClientLayout';
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

import Index from "./pages/Index";
import Products from "./pages/Products";
import Plans from "./pages/Plans";
import Subscriptions from "./pages/Subscriptions";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Invoices from "./pages/Invoices";

import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import ClientDashboard from './pages/client/ClientDashboard';
import ClientInvoices from './pages/client/ClientInvoices';
import ClientPayments from './pages/client/ClientPayments';
import ClientSettings from './pages/client/ClientSettings';
import ClientSubscriptions from './pages/client/ClientSubscriptions';
import ClientSupport from './pages/client/ClientSupport';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />

          {/* Company Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="COMPANY"><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Client Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="CLIENT"><ClientLayout /></ProtectedRoute>}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/subscriptions" element={<ClientSubscriptions />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
            <Route path="/client/payments" element={<ClientPayments />} />
            <Route path="/client/support" element={<ClientSupport />} />
            <Route path="/client/settings" element={<ClientSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes >
      </BrowserRouter >
    </TooltipProvider >
  </QueryClientProvider >
);

export default App;
