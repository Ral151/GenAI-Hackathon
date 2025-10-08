import { useState } from "react";
import { FaLanguage } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { i18n } = useTranslation();

  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // Map language codes to display names
  const langMap = {
    en: "English",
    "zh-HK": "Cantonese",
    "zh-CN": "Mandarin",
  };
  const currentLanguageLabel = langMap[i18n.language] || "English";

  const selectLanguage = (langLabel) => {
    // Find the code from the display name
    const selectedCode = Object.keys(langMap).find(code => langMap[code] === langLabel);
    if (selectedCode && selectedCode !== i18n.language) {
      i18n.changeLanguage(selectedCode);
    }
    closeDropdown();
  };

  return (
    <nav className="bg-white shadow p-4 flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-800">
          <Link to="/" onClick={closeDropdown}>AI</Link>
        </div>
        <button
          className="md:hidden block text-gray-700 hover:text-green-600 ml-4 text-lg focus:outline-none"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="Toggle language dropdown"
        >
          <FaLanguage />
        </button>
      </div>

      <ul className="hidden md:flex flex-wrap space-x-4 text-gray-700 font-medium text-base md:ml-6 md:mt-0 mt-2">
        <li><Link to="/" onClick={closeDropdown}>{currentLanguageLabel === "English" ? "Home" : currentLanguageLabel === "Mandarin" ? "主页" : "主頁"}</Link></li>
        <li><Link to="/map" onClick={closeDropdown}>{currentLanguageLabel === "English" ? "Hospital Map" : currentLanguageLabel === "Mandarin" ? "医院地图" : "醫院地圖"}</Link></li>
        <li><Link to="/triage-helper" onClick={closeDropdown}>{currentLanguageLabel === "English" ? "Triage Helper" : currentLanguageLabel === "Mandarin" ? "分诊助手" : "分診助手"}</Link></li>
        <li><Link to="/chatbot" onClick={closeDropdown}>{currentLanguageLabel === "English" ? "Chatbot" : currentLanguageLabel === "Mandarin" ? "聊天机器人" : "聊天機器人"}</Link></li>
      </ul>

      <div className="relative md:ml-6 md:mt-0 mt-2">
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
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
            className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-menu-button"
          >
            <div className="py-1">
              {Object.values(langMap).map((langLabel) => (
                <button
                  key={langLabel}
                  onClick={() => selectLanguage(langLabel)}
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-green-100"
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
    </nav>
  );
}
