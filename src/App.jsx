import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { store } from "./store/store";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import PrivateRoute from "./components/PrivateRoute";
import AuthPromptModal from "./components/AuthPromptModal";

import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";
import Games from "./pages/Games";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateTournament from "./pages/CreateTournament";
import JoinTournament from "./pages/JoinTournament";
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";
import PlayerSearch from "./pages/PlayerSearch";
import TestAuth from "./pages/TestAuth";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import Gamification from "./pages/Gamification";
import Fantasy from "./pages/Fantasy";
import Community from "./pages/Community";
import AIFeatures from "./pages/AIFeatures";
import Notifications from "./pages/Notifications";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Pricing from "./pages/Pricing";

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Don't show navbar on dashboard pages
  const showNavbar =
    !location.pathname.startsWith("/dashboard") &&
    !location.pathname.startsWith("/tournaments") &&
    !location.pathname.startsWith("/leaderboard") &&
    !location.pathname.startsWith("/gamification") &&
    !location.pathname.startsWith("/fantasy") &&
    !location.pathname.startsWith("/community") &&
    !location.pathname.startsWith("/ai-features") &&
    !location.pathname.startsWith("/profile") &&
    !location.pathname.startsWith("/settings");

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      {/* Auth Prompt Modal - Shows on public pages for non-authenticated users */}
      <AuthPromptModal />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/about" element={<About />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Require Authentication */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/tournaments"
            element={
              <PrivateRoute>
                <Tournaments />
              </PrivateRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/gamification"
            element={
              <PrivateRoute>
                <Gamification />
              </PrivateRoute>
            }
          />

          <Route
            path="/fantasy"
            element={
              <PrivateRoute>
                <Fantasy />
              </PrivateRoute>
            }
          />

          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />

          <Route
            path="/ai-features"
            element={
              <PrivateRoute>
                <AIFeatures />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-tournament"
            element={
              <PrivateRoute>
                <CreateTournament />
              </PrivateRoute>
            }
          />

          <Route
            path="/tournament/:id"
            element={
              <PrivateRoute>
                <TournamentDetail />
              </PrivateRoute>
            }
          />

          <Route
            path="/tournament/:id/join"
            element={
              <PrivateRoute>
                <JoinTournament />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          {/* Semi-Protected Routes - Can view but limited functionality */}
          <Route path="/player/:userId" element={<PublicProfile />} />
          <Route path="/players" element={<PlayerSearch />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route path="/test-auth" element={<TestAuth />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(() => {
    // Only show loading screen if this is the first visit
    return !sessionStorage.getItem("hasVisited");
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("hasVisited", "true");
      }, 5500);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </Provider>
  );
}
