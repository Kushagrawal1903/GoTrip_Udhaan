import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PlanTrip from './pages/PlanTrip';
import TripResult from './pages/TripResult';
import PublicTripResult from './pages/PublicTripResult';
import PublicTripCard from './pages/PublicTripCard';
import JoinTrip from './pages/JoinTrip';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy-loaded dashboard pages
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyTrips = lazy(() => import('./pages/dashboard/MyTrips'));
const TravelStats = lazy(() => import('./pages/dashboard/TravelStats'));
const PackingLists = lazy(() => import('./pages/dashboard/PackingLists'));
const Collaborations = lazy(() => import('./pages/dashboard/Collaborations'));
const Exports = lazy(() => import('./pages/dashboard/Exports'));
const Explore = lazy(() => import('./pages/dashboard/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

/**
 * ProtectedRoute — redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Main App component with routing and layout
 */
export default function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-primary)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: '1.4rem',
          color: 'var(--color-primary)',
        }}>
          GoTrip
        </div>
        <div className="loading-dots" style={{ marginTop: 4 }}>
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ─── Dashboard layout routes (sidebar + topbar) ─── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="trips" element={<MyTrips />} />
        <Route path="stats" element={<TravelStats />} />
        <Route path="packing-lists" element={<PackingLists />} />
        <Route path="collaborations" element={<Collaborations />} />
        <Route path="exports" element={<Exports />} />
        <Route path="explore" element={<Explore />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ─── Trip Wizard — full-screen immersive route (no Navbar/Footer) ─── */}
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <PlanTrip />
          </ProtectedRoute>
        }
      />

      {/* ─── Public/standalone routes (with Navbar + Footer) ─── */}
      <Route
        path="*"
        element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
                <Route
                  path="/trip/:id"
                  element={
                    <ProtectedRoute>
                      <TripResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/join/:shareToken"
                  element={
                    <ProtectedRoute>
                      <JoinTrip />
                    </ProtectedRoute>
                  }
                />
                <Route path="/share/:shareId" element={<PublicTripResult />} />
                <Route path="/trip/:tripId/card" element={<PublicTripCard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
