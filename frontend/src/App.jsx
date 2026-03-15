import { Toaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './page.config'
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { WebSocketProvider } from '@/lib/WebSocketContext';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import AdminDashboard from '@/pages/AdminDashboard';
import DashboardLayout from '@/components/DashboardLayout';
import { LanguageProvider } from '@/components/LanguageContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Pages that use DashboardLayout (authenticated)
const DASHBOARD_PAGES = new Set([
  'Dashboard', 'MyProfile', 'Applications', 'Messages',
  'NewApplication', 'AppointmentBooking',
]);

/** Route guard — redirects to /login if not authenticated */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_staff) return <Navigate to="/Dashboard" replace />;
  return children;
};

/** Redirect authenticated users away from auth pages */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/Dashboard" replace />;
  return children;
};

const LayoutWrapper = ({ children, currentPageName }) => {
  if (DASHBOARD_PAGES.has(currentPageName)) {
    return (
      <Layout currentPageName={currentPageName}>
        <DashboardLayout>{children}</DashboardLayout>
      </Layout>
    );
  }
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => {
        const isDashboard = DASHBOARD_PAGES.has(path);
        const element = (
          <LayoutWrapper currentPageName={path}>
            <Page />
          </LayoutWrapper>
        );
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={isDashboard ? <ProtectedRoute>{element}</ProtectedRoute> : element}
          />
        );
      })}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <Link to="/" className="inline-block mt-4 px-6 py-2 bg-[#1e3a5f] text-white rounded-full hover:bg-[#2a4a6f]">Go Home</Link>
          </div>
        </div>
      } />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <WebSocketProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster position="top-right" richColors />  {/* ← sonner Toaster */}
          </WebSocketProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
