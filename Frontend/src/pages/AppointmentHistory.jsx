import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AppointmentHistory() {
  const { t, i18n } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUserAndAppointments() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setLoading(false);
        setUser(null);
        return;
      }

      setUser(userData.user);

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("appointmentDate", { ascending: false });

      if (error) {
        alert(i18n.language === 'zh-CN' ? "加载预约时出错：" : "Error loading appointments: " + error.message);
      } else {
        setAppointments(data);
      }
      setLoading(false);
    }

    fetchUserAndAppointments();
  }, [i18n.language]);

  if (loading) return <p>{t("loading_appointments", "Loading appointments...")}</p>;

  if (!user) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" replace />;
  }

  if (appointments.length === 0) return <p>{t("no_appointments_found", "No appointments found.")}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">{t("appointment_history_title", "Your Appointment History")}</h2>
      <ul className="space-y-4">
        {appointments.map((appt) => (
          <li key={appt.id} className="border p-4 rounded shadow-sm">
            <p><strong>{t("appointment_date", "Appointment Date")}:</strong> {appt.appointmentDate}</p>
            <p><strong>{t("time", "Time")}:</strong> {appt.appointmentTime}</p>
            <p><strong>{t("name", "Name")}:</strong> {appt.name}</p>
            <p><strong>{t("preferred_hospital", "Preferred Hospital")}:</strong> {appt.preferredHospital || t("not_specified", "Not specified")}</p>
            <p><strong>{t("current_conditions", "Current Conditions")}:</strong> {appt.currentConditions || t("not_available", "N/A")}</p>
            <p><strong>{t("past_conditions", "Past Conditions")}:</strong> {appt.pastConditions || t("not_available", "N/A")}</p>
            <p><strong>{t("allergies", "Allergies")}:</strong> {appt.allergies || t("not_available", "N/A")}</p>
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm text-gray-600">
                <strong>{t("permissions", "Permissions")}:</strong> 
                {appt.shareHospital ? ` ${t("hospital_sharing", "Hospital Sharing")}` : ""}
                {appt.shareHospital && appt.shareEmergency ? ` ${t("and", "|")} ` : ""}
                {appt.shareEmergency ? ` ${t("emergency_contact_sharing", "Emergency Contact Sharing")}` : ""}
                {!appt.shareHospital && !appt.shareEmergency ? ` ${t("no_sharing_permissions", "No sharing permissions")}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}