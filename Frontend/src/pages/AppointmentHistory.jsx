import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

export default function AppointmentHistory() {
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
        .order("appointment_date", { ascending: false });

      if (error) {
        alert("Error loading appointments: " + error.message);
      } else {
        setAppointments(data);
      }
      setLoading(false);
    }

    fetchUserAndAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;

  if (!user) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" replace />;
  }

  if (appointments.length === 0) return <p>No appointments found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Your Appointment History</h2>
      <ul className="space-y-4">
        {appointments.map((appt) => (
          <li key={appt.id} className="border p-4 rounded shadow-sm">
            <p><strong>Appointment Date:</strong> {appt.appointment_date}</p>
            <p><strong>Time:</strong> {appt.appointment_time}</p>
            <p><strong>Name:</strong> {appt.name}</p>
            <p><strong>Current Conditions:</strong> {appt.current_conditions || "N/A"}</p>
            <p><strong>Permissions:</strong> {appt.share_hospital ? "Shared with hospital" : "Not shared"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
