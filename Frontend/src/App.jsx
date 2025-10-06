import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import HospitalMap from "./pages/HospitalMap";
import SymptomTriage from "./pages/SymptomTriage";
import Chatbot from "./pages/Chatbot";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="map" element={<HospitalMap />} />
        <Route path="triage" element={<SymptomTriage />} />
        <Route path="chatbot" element={<Chatbot />} />
      </Route>
    </Routes>
  );
}
