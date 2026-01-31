import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminManagement from './pages/dashboard/AdminManagement';
import AdManagement from './pages/dashboard/AdManagement';
import SponsorshipManagement from './pages/dashboard/SponsorshipManagement';
import AttributeManager from './pages/dashboard/AttributeManager';
import CategoryManager from './pages/dashboard/CategoryManager';
import FormPreview from './pages/dashboard/FormPreview';
import UserManagement from './pages/dashboard/UserManagement';
import ProductManagement from './pages/dashboard/ProductManagement';
import ProductModeration from './pages/dashboard/ProductModeration';
import BoostPackageManagement from './pages/dashboard/BoostPackageManagement';
import BoostRequestManagement from './pages/dashboard/BoostRequestManagement';
import PaymentAgentManagement from './pages/dashboard/PaymentAgentManagement';
import ActiveBoostManagement from './pages/dashboard/ActiveBoostManagement';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-[#0a0a0a]/10 border-t-[#0a0a0a] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const HomeDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-[#0a0a0a]">Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
          <p className="text-neutral-500 text-sm font-medium">Metric {i}</p>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<HomeDashboard />} />
                    <Route path="/form-preview" element={<FormPreview />} />
                    <Route path="/categories" element={<CategoryManager />} />
                    <Route path="/ads" element={<AdManagement />} />
                    <Route path="/attributes" element={<AttributeManager />} />
                    <Route path="/sponsorships" element={<SponsorshipManagement />} />
                    <Route path="/admins" element={<AdminManagement />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/moderation" element={<ProductModeration />} />
                    <Route path="/boosts" element={<BoostPackageManagement />} />
                    <Route path="/boost-requests" element={<BoostRequestManagement />} />
                    <Route path="/payment-agents" element={<PaymentAgentManagement />} />
                    <Route path="/active-boosts" element={<ActiveBoostManagement />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
