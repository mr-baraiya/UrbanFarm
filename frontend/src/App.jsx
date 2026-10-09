import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GuestLayout from "./components/Guest/GuestLayout";
import LandingPage from "./pages/Guest/LandingPage";
import AboutPage from "./pages/Guest/AboutPage";
import FeaturesPage from "./pages/Guest/FeaturesPage";
import ContactPage from "./pages/Guest/ContactPage";
import FaqPage from "./pages/Guest/FaqPage";
import DemoPage from "./pages/Guest/DemoPage";
import RewardsPage from "./pages/Guest/RewardsPage";
import MarketPricesPage from "./pages/Guest/MarketPricesPage";
import DownloadPage from "./pages/Guest/DownloadPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MainApp from "./pages/MainApp";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import AdminRoute from "./components/Common/AdminRoute";
import FirstVisitLanguageModal from "./components/Common/FirstVisitLanguageModal";
import ScrollToTop from "./components/Common/ScrollToTop";
import { useAuth } from "./hooks/useAuth";

import PlantDetail from "./components/Plants/PlantDetail";
import CommunityTab from "./components/Community/CommunityTab";
import DiagnoseTab from "./components/Diagnose/DiagnoseTab";
import PublicDiagnosisReport from "./pages/Guest/PublicDiagnosisReport";
import Layout from "./components/Layout/Layout";
import GuestNavbar from "./components/Guest/GuestNavbar";
import GuestFooter from "./components/Guest/GuestFooter";
import UrbanBot from "./components/Chatbot/UrbanBot";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "var(--sage, #4a3f3a)",
        }}
      >
        Loading your urban farm...
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <FirstVisitLanguageModal />
      <UrbanBot />
      <Routes>
        {/* Guest Public Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/live-preview" element={<DemoPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/market-prices" element={<MarketPricesPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/app-download" element={<DownloadPage />} />
          <Route path="/apk" element={<DownloadPage />} />
        </Route>

        {/* Public Plant Detail Routes (Accessible with or without login) */}
        <Route
          path="/app/plants/:id"
          element={
            user ? (
              <Layout>
                <PlantDetail />
              </Layout>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
                <GuestNavbar />
                <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                  <PlantDetail />
                </main>
                <GuestFooter />
              </div>
            )
          }
        />
        <Route
          path="/plants/:id"
          element={
            user ? (
              <Layout>
                <PlantDetail />
              </Layout>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
                <GuestNavbar />
                <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                  <PlantDetail />
                </main>
                <GuestFooter />
              </div>
            )
          }
        />

        {/* Public Community Feed & Post Routes (Accessible with or without login) */}
        <Route
          path="/app/community"
          element={
            user ? (
              <Layout>
                <CommunityTab />
              </Layout>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
                <GuestNavbar />
                <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                  <CommunityTab />
                </main>
                <GuestFooter />
              </div>
            )
          }
        />
        <Route
          path="/community"
          element={
            user ? (
              <Layout>
                <CommunityTab />
              </Layout>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
                <GuestNavbar />
                <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                  <CommunityTab />
                </main>
                <GuestFooter />
              </div>
            )
          }
        />

        {/* Public Dedicated Plant Diagnosis Report Routes */}
        <Route path="/d/:id" element={<PublicDiagnosisReport />} />
        <Route path="/diagnose/report/:id" element={<PublicDiagnosisReport />} />
        <Route path="/app/diagnose/report/:id" element={<PublicDiagnosisReport />} />
        <Route path="/diagnosis/report/:id" element={<PublicDiagnosisReport />} />

        {/* Public Plant Diagnosis Tool Routes */}
        {['/diagnose', '/app/diagnose', '/diagnosis', '/app/diagnosis'].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              user ? (
                <Layout>
                  <DiagnoseTab />
                </Layout>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
                  <GuestNavbar />
                  <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                    <DiagnoseTab />
                  </main>
                  <GuestFooter />
                </div>
              )
            }
          />
        ))}

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/app"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/app"}
                replace
              />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User Protected Routes */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <MainApp />
              )}
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
