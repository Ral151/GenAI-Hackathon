import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(i18n.language === 'zh-CN' ? "注册错误：" : "Sign-up error: " + error.message);
      setLoading(false);
      return;
    }

    // Insert profile after successful sign-up
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id, // use auth user id as PK in profiles
          email: email,
          name: name,
          dob: dob,
          sex: sex,
        },
      ]);

      if (profileError) {
        alert(i18n.language === 'zh-CN' ? "创建个人资料时出错：" : "Profile creation error: " + profileError.message);
        setLoading(false);
        return;
      }
    }

    alert(i18n.language === 'zh-CN' ? "注册成功！请验证您的邮箱。" : "Registration successful! Please verify your email.");
    navigate("/login");
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
          {t("register_title", "Create Account")}
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              {t("email", "Email")}
            </label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t("password_placeholder", "Enter your password")}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("full_name", "Full Name")}
            </label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("full_name_placeholder", "Enter your full name")}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("date_of_birth", "Date of Birth")}
            </label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              {t("sex", "Sex")}
            </label>
            <select
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="" disabled>
                {t("select_sex_placeholder", "Select your sex")}
              </option>
              <option value="Male">{t("male", "Male")}</option>
              <option value="Female">{t("female", "Female")}</option>
              <option value="Other">{t("other", "Other")}</option>
              <option value="Prefer not to say">{t("prefer_not_to_say", "Prefer not to say")}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-teal-400 transition"
          >
            {loading ? t("creating_account", "Creating Account...") : t("create_account_button", "Create Account")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span>{t("already_have_account", "Already have an account?")} </span>
          <button
            className="text-teal-700 underline font-medium"
            onClick={() => navigate("/login")}
          >
            {t("login", "Login")}
          </button>
        </div>
      </div>
    </div>
  );
}