import { useState } from 'react';

const questions = [
  "Do you have a fever?",
  "Are you experiencing a cough?",
  "Do you have trouble breathing?"
];

export default function SymptomTriage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    }
  };

  return (
    <div className="flex flex-col items-center py-10 min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-6">Symptom Triage</h2>
      <div className="text-xl font-semibold mb-8">{questions[current]}</div>
      <div>
        <button onClick={() => handleAnswer('Yes')} className="px-6 py-3 bg-green-600 text-white rounded-xl mx-2">Yes</button>
        <button onClick={() => handleAnswer('No')} className="px-6 py-3 bg-gray-400 text-white rounded-xl mx-2">No</button>
      </div>
      {current === questions.length - 1 && answers.length === questions.length && (
        <div className="mt-10">
          <p className="text-lg font-semibold text-orange-500">Thank you. Seek medical advice if you answered yes to any question!</p>
        </div>
      )}
    </div>
  );
}
