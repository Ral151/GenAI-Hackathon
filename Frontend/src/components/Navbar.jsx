import { useState } from "react";
import { FaLanguage, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { i18n } = useTranslation();

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Map language codes to display names
  const langMap = {
    en: "English",
    "zh-HK": "Cantonese",
    "zh-CN": "Mandarin",
  };
  const currentLanguageLabel = langMap[i18n.language] || "English";

  const selectLanguage = (langLabel) => {
    const selectedCode = Object.keys(langMap).find(code => langMap[code] === langLabel);
    if (selectedCode && selectedCode !== i18n.language) {
      i18n.changeLanguage(selectedCode);
    }
    closeDropdown();
    closeSidebar();
  };

  // Navigation items with translations
  const navItems = [
    { path: "/", label: { en: "Home", "zh-CN": "主页", "zh-HK": "主頁" } },
    { path: "/map", label: { en: "Hospital Map", "zh-CN": "医院地图", "zh-HK": "醫院地圖" } },
    { path: "/triage-helper", label: { en: "Triage Helper", "zh-CN": "分诊助手", "zh-HK": "分診助手" } },
    { path: "/admin-helper", label: { en: "Admin Helper", "zh-CN": "管理员助手", "zh-HK": "管理員助手" } },
  ];

  const getTranslatedLabel = (labelObj) => {
    return labelObj[i18n.language] || labelObj.en;
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        {/* Left side - User profile and mobile menu button */}
        <div className="flex items-center">
          <button
            className="md:hidden block text-gray-700 hover:text-green-600 mr-4 text-lg focus:outline-none"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
          </button>
          <div className="text-xl font-semibold text-gray-800">
            <Link to="/profile" onClick={closeSidebar}>
              <FaUserCircle className="w-10 h-10 md:w-12 md:h-12" />
            </Link>
          </div>
        </div>

        {/* Center - Navigation links (desktop only) */}
        <ul className="hidden md:flex flex-wrap space-x-8 lg:space-x-10 text-gray-700 font-medium text-base">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={closeDropdown}
                className="hover:text-green-600 transition-colors duration-200"
              >
                {getTranslatedLabel(item.label)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side - Language selector (desktop) */}
        <div className="hidden md:block relative">
          <button
            onClick={toggleDropdown}
            className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="Select language"
            id="language-menu-button"
          >
            <FaLanguage className="mr-2 text-green-600" />
            {currentLanguageLabel}
            <svg
              className="ml-2 -mr-1 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.29l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10 focus:outline-none z-20"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="language-menu-button"
            >
              <div className="py-1">
                {Object.values(langMap).map((langLabel) => (
                  <button
                    key={langLabel}
                    onClick={() => selectLanguage(langLabel)}
                    className="block px-4 py-2 text-sm w-full text-left hover:bg-green-100 transition-colors duration-200"
                    role="menuitem"
                    tabIndex={0}
                  >
                    {langLabel}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile language button */}
        <button
          className="md:hidden block text-gray-700 hover:text-green-600 text-lg focus:outline-none"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="Toggle language dropdown"
        >
          <FaLanguage className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-opacity-100"
          onClick={closeSidebar}
        ></div>
        
        {/* Sidebar Content */}
        <div className="relative w-64 h-full bg-white shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close menu"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className="block py-2 px-4 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors duration-200 font-medium"
                  >
                    {getTranslatedLabel(item.label)}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Language selector in sidebar */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="px-4 text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Language
              </h3>
              <div className="space-y-2">
                {Object.values(langMap).map((langLabel) => (
                  <button
                    key={langLabel}
                    onClick={() => selectLanguage(langLabel)}
                    className={`block w-full text-left py-2 px-4 rounded-md transition-colors duration-200 ${
                      currentLanguageLabel === langLabel
                        ? "bg-green-100 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {langLabel}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile language dropdown (outside sidebar) */}
      {dropdownOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={closeDropdown}>
          <div className="absolute top-16 right-4 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10">
            <div className="py-1">
              {Object.values(langMap).map((langLabel) => (
                <button
                  key={langLabel}
                  onClick={() => selectLanguage(langLabel)}
                  className="block px-4 py-3 text-base w-full text-left hover:bg-green-100 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                  role="menuitem"
                  tabIndex={0}
                >
                  {langLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}