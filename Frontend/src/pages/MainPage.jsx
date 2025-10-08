import { useState } from "react";
import { FaLanguage } from "react-icons/fa";
import { FcPhoneAndroid, FcBiotech, FcAutomotive } from "react-icons/fc";
import { Link } from "react-router-dom";

export default function App() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectLanguage = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const sections = [
    {
      title: "Hospital Map",
      description: "Locate nearest Hospital",
      icon: <FcAutomotive />,
      path: "/map",
    },
    {
      title: "Triage Helper",
      description: "Detect your symptoms",
      icon: <FcBiotech />,
      path: "/triage-helper",
    },
    {
      title: "Admin Helper",
      description: "Handle appointment & info",
      icon: <FcPhoneAndroid />,
      path: "/admin-helper",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">
          We’re here to help you cure your sickness
        </h1>
        <p className="text-center text-green-600 mb-10 cursor-pointer hover:underline">
          Choose service do you want to use &gt;&gt;
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
