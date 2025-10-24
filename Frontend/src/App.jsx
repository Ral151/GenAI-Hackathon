import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./pages/supabaseClient";

import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import HospitalMap from "./pages/HospitalMap";
import TriageHelper from "./pages/TriageHelper";
import AdminHelper from "./pages/AdminHelper";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfile from "./pages/UserProfile";
import AppointmentHistory from "./pages/AppointmentHistory";
import ChatbotHistory from "./pages/ChatbotHistory";

function ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />; // Render child routes when authenticated
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route index element={<MainPage />} />
        <Route path="map" element={<HospitalMap />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="triage-helper" element={<TriageHelper />} />
          <Route path="admin-helper" element={<AdminHelper />} />
          <Route path="appointments" element={<AppointmentHistory />} />
          <Route path="chat-history" element={<ChatbotHistory />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}
