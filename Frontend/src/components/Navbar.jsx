import { useState } from "react";
import { FaLanguage } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectLanguage = (lang) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow p-4 flex flex-col md:flex-row md:justify-between md:items-center sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-800">
          <Link to="/">AI</Link>
        </div>
        <button
          className="md:hidden block text-gray-700 hover:text-green-600 ml-4 text-lg focus:outline-none"
          onClick={toggleDropdown}
          aria-label="Open language dropdown"
        >
          <FaLanguage />
        </button>
      </div>
      <ul className="hidden md:flex flex-wrap space-x-4 text-gray-700 font-medium text-base md:ml-6 md:mt-0 mt-2">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/map">Hospital Map</Link></li>
        <li><Link to="/triage-helper">Triage Helper</Link></li>
        <li><Link to="/chatbot">Chatbot</Link></li>
      </ul>
      <div className="relative md:ml-6 md:mt-0 mt-2">
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <FaLanguage className="mr-2 text-green-600" />
          {language}
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
          <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-10 focus:outline-none z-10">
            <div className="py-1">
              {["English", "Cantonese", "Mandarin"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => selectLanguage(lang)}
                  className="block px-4 py-2 text-sm w-full text-left hover:bg-green-100"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
