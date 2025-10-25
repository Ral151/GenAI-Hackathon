import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Sample list of Hong Kong hospitals (you might want to expand this)
const HONG_KONG_HOSPITALS = [
  "Queen Mary Hospital",
  "Prince of Wales Hospital",
  "Queen Elizabeth Hospital",
  "Pamela Youde Nethersole Eastern Hospital",
  "United Christian Hospital",
  "Tuen Mun Hospital",
  "Alice Ho Miu Ling Nethersole Hospital",
  "Princess Margaret Hospital",
  "Yan Chai Hospital",
  "Caritas Medical Centre",
  "Kwong Wah Hospital",
  "North District Hospital",
  "Pok Oi Hospital",
  "Ruttonjee Hospital",
  "St. John Hospital",
  "Tang Shiu Kin Hospital",
  "Tsan Yuk Hospital",
  "Tung Wah Hospital",
  "Hong Kong Sanatorium & Hospital",
  "St. Paul's Hospital",
  "Adventist Hospital",
  "Canossa Hospital",
  "Evangel Hospital",
  "Gleneagles Hospital Hong Kong",
  "Prebyterian Community Hospital"
];

export default function AdminHelper() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    sex: "",
    hkid_number: "",
    allergies: "",
    currentConditions: "",
    pastConditions: "",
    appointmentDate: "",
    appointmentTime: "",
    preferredHospital: "",
    shareHospital: false,
    shareEmergency: false,
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospitalSuggestions, setHospitalSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleHospitalSearch = (searchTerm) => {
    if (searchTerm.length === 0) {
      setHospitalSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = HONG_KONG_HOSPITALS.filter(hospital =>
      hospital.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setHospitalSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleHospitalChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      preferredHospital: value
    }));
    handleHospitalSearch(value);
  };

  const selectHospital = (hospital) => {
    setForm(prev => ({
      ...prev,
      preferredHospital: hospital
    }));
    setShowSuggestions(false);
    setHospitalSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert(i18n.language === 'zh-CN' ? "请登录以提交预约。" : "Please log in to submit appointments.");
      return;
    }

    const appointmentData = {
      ...form,
      user_id: userId,
    };

    const { error } = await supabase
      .from("appointments")
      .insert([appointmentData]);

    if (error) {
      alert(i18n.language === 'zh-CN' ? "提交预约时出错：" : "Error submitting appointment: " + error.message);
    } else {
      alert(i18n.language === 'zh-CN' ? "预约请求已提交！" : "Appointment request submitted!");
      // Optionally clear form
    }
  };

  if (loading) return <p></p>;

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h2 className="text-3xl font-semibold mb-6">
        {t("admin_helper_title", "Admin Helper - Appointment Booking")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal details */}
        <div>
          <label className="block font-medium mb-1">{t("full_name", "Full Name")}</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder={t("full_name_placeholder", "Enter your full name")}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">{t("date_of_birth", "Date of Birth")}</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">{t("sex", "Sex")}</label>
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">{t("select", "Select")}</option>
            <option value="female">{t("female", "Female")}</option>
            <option value="male">{t("male", "Male")}</option>
            <option value="other">{t("other", "Other")}</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">{t("id_number", "ID (e.g., HKID)")}</label>
          <input
            type="text"
            name="hkid_number"
            value={form.hkid_number}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
            placeholder={t("id_placeholder", "Enter your ID number")}
          />
        </div>
        
        {/* Preferred Hospital Field */}
        <div className="relative">
          <label className="block font-medium mb-1">{t("preferred_hospital", "Preferred Hospital")}</label>
          <input
            type="text"
            name="preferredHospital"
            value={form.preferredHospital}
            onChange={handleHospitalChange}
            placeholder={t("hospital_placeholder", "Start typing to search hospitals...")}
            className="w-full rounded border px-3 py-2"
          />
          {showSuggestions && hospitalSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {hospitalSuggestions.map((hospital, index) => (
                <div
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                  onClick={() => selectHospital(hospital)}
                >
                  {hospital}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">{t("allergies", "Allergies")}</label>
          <textarea
            name="allergies"  
            value={form.allergies}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
            placeholder={t("allergies_placeholder", "List any allergies you have")}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            {t("current_conditions", "Current Medical Conditions")}
          </label>
          <textarea
            name="currentConditions"
            value={form.currentConditions}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
            placeholder={t("current_conditions_placeholder", "Describe your current medical conditions")}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            {t("past_conditions", "Past Medical Conditions")}
          </label>
          <textarea
            name="pastConditions"
            value={form.pastConditions}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
            placeholder={t("past_conditions_placeholder", "Describe any past medical conditions")}
          />
        </div>
        
        {/* Appointment booking */}
        <div>
          <label className="block font-medium mb-1">
            {t("preferred_date", "Preferred Appointment Date")}
          </label>
          <input
            type="date"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">{t("preferred_time", "Preferred Time")}</label>
          <input
            type="time"
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        
        {/* Permissions */}
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="shareHospital"
              checked={form.shareHospital}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-600"
            />
            <span className="ml-2">
              {t("share_hospital", "Permission to share information with hospital")}
            </span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="shareEmergency"
              checked={form.shareEmergency}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-600"
            />
            <span className="ml-2">
              {t("share_emergency", "Permission to share with emergency contacts")}
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700"
        >
          {t("submit_appointment", "Submit Appointment Request")}
        </button>
      </form>
    </div>
  );
}