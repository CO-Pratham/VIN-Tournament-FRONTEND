import { Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { store } from "./store/store";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";

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


function AppContent() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/games" element={<Games />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/tournament/:id" element={<TournamentDetail />} />
          <Route path="/tournament/:id/join" element={<JoinTournament />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/player/:userId" element={<PublicProfile />} />
          <Route path="/players" element={<PlayerSearch />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(() => {
    // Only show loading screen if this is the first visit
    return !sessionStorage.getItem('hasVisited');
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('hasVisited', 'true');
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