import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SymptomQuestion({ question, answers, onAnswer }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const handleSelect = (answer) => {
    setSelected(answer);
    onAnswer(answer);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">{t(question)}</h2>
      <ul>
        {answers.map((ans, idx) => (
          <li key={idx}>
            <button
              onClick={() => handleSelect(ans)}
              className={`block w-full text-left px-4 py-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 ${
                selected === ans
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
              }`}
            >
              {t(ans)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
