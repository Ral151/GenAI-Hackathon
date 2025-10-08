import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import HospitalMap from "./pages/HospitalMap";
import TriageHelper from "./pages/TriageHelper";
import AdminHelper from "./pages/AdminHelper";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="map" element={<HospitalMap />} />
        <Route path="triage-helper" element={<TriageHelper />} />
        <Route path="admin-helper" element={<AdminHelper />} />
      </Route>
    </Routes>
  );
}
