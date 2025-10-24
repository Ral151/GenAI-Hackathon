import { useTranslation } from "react-i18next";
import { FaClipboardList } from "react-icons/fa";
import { FcPhoneAndroid, FcBiotech, FcAutomotive } from "react-icons/fc";
import { Link } from "react-router-dom";

export default function MainPage() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("hospital_map"),
      description: t("See all hospitals in Hong Kong on an interactive map."),
      icon: <FcAutomotive />,
      path: "/map",
    },
    {
      title: t("triage_helper"),
      description: t("Assist you in determining the urgency of your medical condition and make an appointment."),
      icon: <FcBiotech />,
      path: "/triage-helper",
    },
    {
      title: t("admin_helper"),
      description: t("Get help with administrative tasks related to your healthcare."),
      icon: <FcPhoneAndroid />,
      path: "/admin-helper",
    },
    {
      title: t("appointment_history"),
      description: t("View your past appointments and their details."),
      icon: <FaClipboardList />,
      path: "/appointments",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">
          {t("welcome_message")}
        </h1>
        <p className="text-center text-green-600 mb-10 cursor-pointer hover:underline">
          {t("choose_service")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sections.map(({ title, description, icon, path }) => (
            <Link key={title} to={path}>
              <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg cursor-pointer transition-shadow duration-150 flex flex-col items-start h-full">
                <div className="text-green-600 text-3xl mb-4">{icon}</div>
                <h2 className="font-semibold text-lg mb-2">{title}</h2>
                <p className="text-orange-600">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
