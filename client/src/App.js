import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SystemProvider } from './context/SystemContext';

// Pages
import LoginPage from './pages/auth/LoginPage';



// Inventory
import InventoryLayout from './pages/inventory/InventoryLayout';
import VantaBackground from './VantaBackground';
import HomePage from './pages/inventory/HomePage';
import ItemsPage from './pages/inventory/ItemsPage';
import ItemDetailsPage from './pages/inventory/ItemDetailsPage';
import StockLogsPage from './pages/inventory/StockLogsPage';
import MaintenancePage from './pages/inventory/MaintenancePage';
import ScannerPage from './pages/inventory/ScannerPage';
import BarcodePage from './pages/inventory/BarcodePage';






// Admin
import UsersPage from './pages/admin/UsersPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-primary-400 text-lg animate-pulse font-display">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const showVanta = true;

  return (
    <>
      <VantaBackground />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Inventory Module */}
        <Route path="/inventory" element={<ProtectedRoute><InventoryLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="items/:id" element={<ItemDetailsPage />} />
          <Route path="stock-logs" element={<StockLogsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="barcodes" element={<BarcodePage />} />
          <Route path="users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        </Route>







        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SystemProvider>
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster position="top-right" toastOptions={{
            icon: null,
            style: { 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: '#fff', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '16px'
            }
          }} />
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
      </SystemProvider>
    </ThemeProvider>
  );
}
