import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function UserProfile() {
  const { t, i18n } = useTranslation();
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
        alert(i18n.language === 'zh-CN' ? "加载个人资料时出错：" : "Error loading profile: " + error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, [i18n.language]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(i18n.language === 'zh-CN' ? "退出登录时出错：" : "Logout error: " + error.message);
    } else {
      navigate("/login");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("not_provided", "Not provided");
    try {
      return new Date(dateString).toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US');
    } catch {
      return dateString;
    }
  };

  const formatSex = (sex) => {
    if (!sex) return t("not_provided", "Not provided");
    
    const sexMap = {
      'female': t("female", "Female"),
      'male': t("male", "Male"),
      'other': t("other", "Other")
    };
    
    return sexMap[sex] || sex;
  };

  if (loading) return <p className="text-center mt-10">{t("loading_profile", "Loading profile...")}</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile)
    return <p className="text-center mt-10 text-red-600">{t("no_profile_data", "No profile data found.")}</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200 sm:max-w-lg md:max-w-xl">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-gray-800">
        {t("user_profile_title", "User Profile")}
      </h2>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">{t("email", "Email")}:</span>
          <span className="text-gray-900 break-words">{profile.email}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">{t("full_name", "Full Name")}:</span>
          <span className="text-gray-900 break-words">{profile.name || t("not_provided", "Not provided")}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between border-b pb-3">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">{t("date_of_birth", "Date of Birth")}:</span>
          <span className="text-gray-900 break-words">{formatDate(profile.dob)}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <span className="font-medium text-gray-700 mb-1 sm:mb-0">{t("sex", "Sex")}:</span>
          <span className="text-gray-900 break-words">{formatSex(profile.sex)}</span>
        </div>
      </div>
      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {t("logout", "Logout")}
        </button>
      </div>
    </div>
  );
}