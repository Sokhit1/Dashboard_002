/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CrmProvider } from './context/CrmContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { DealsPage } from './pages/DealsPage';
import { ContactsPage } from './pages/ContactsPage';
import { AccountsPage } from './pages/AccountsPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { ForecastPage } from './pages/ForecastPage';
import { ProductsPage } from './pages/ProductsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.8 }}
      >
        <Routes location={location}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/signup') {
    const authTab = location.pathname === '/signup' ? 'signup' : 'signin';
    return <AuthPage key={authTab} initialMode={authTab} />;
  }

  return (
    <AppLayout>
      <AnimatedRoutes />
    </AppLayout>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CrmProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </CrmProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
