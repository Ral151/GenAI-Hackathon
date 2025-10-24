import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserProfile() {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData?.user) {
        setLoading(false);
        setUser(null);
        return;
      }

      setUser(sessionData.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("email, name, dob, sex")
        .eq("id", sessionData.user.id)
        .single();

      if (error) {
        alert("Error loading profile: " + error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout error: " + error.message);
    } else {
      navigate("/login");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile)
    return <p className="text-center mt-10 text-red-600">No profile data found.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 sm:max-w-lg md:max-w-xl">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-gray-800">
        User Profile
      </h2>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Email:</span>
          <span className="text-gray-900 break-words">{profile.email}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Full Name:</span>
          <span className="text-gray-900 break-words">{profile.name || "Not provided"}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Date of Birth:</span>
          <span className="text-gray-900 break-words">{profile.dob || "Not provided"}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Sex:</span>
          <span className="text-gray-900 break-words">{profile.sex || "Not provided"}</span>
        </div>
      </div>
      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
