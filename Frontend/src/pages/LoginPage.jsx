import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(i18n.language === 'zh-CN' ? "登录错误：" : "Login error: " + error.message);
    } else {
      alert(i18n.language === 'zh-CN' ? "登录成功！" : "Login successful!");
      navigate("/"); // redirect to home or dashboard
    }
    setLoading(false);
  };

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    i18n.changeLanguage(currentLang === 'en' ? 'zh-CN' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* Language Toggle Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          {i18n.language === 'en' ? '中文' : 'English'}
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {t("login_title", "Login")}
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              {t("email", "Email")}
            </label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder={t("email_placeholder", "Enter your email")}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("password", "Password")}
            </label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={t("password_placeholder", "Enter your password")}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-teal-400 transition"
          >
            {loading ? t("logging_in", "Logging in...") : t("login_button", "Login")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span>{t("no_account", "Don't have an account?")} </span>
          <button
            className="text-teal-700 underline font-medium"
            onClick={() => navigate("/register")}
          >
            {t("create_account", "Create one")}
          </button>
        </div>
      </div>
    </div>
  );
}