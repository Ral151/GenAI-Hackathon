import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Navigate } from "react-router-dom";

export default function AdminHelper() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    sex: "",
    id: "",
    allergies: "",
    currentConditions: "",
    pastConditions: "",
    appointmentDate: "",
    appointmentTime: "",
    shareHospital: false,
    shareEmergency: false,
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) return <p></p>;

  if (!userId) {
    // Redirect to login if no logged-in user found
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Please log in to submit appointments.");
      return;
    }

    const appointmentData = {
      ...form,
      user_id: userId,
    };

    const { error } = await supabase
      .from("appointments")
      .insert([appointmentData]);

    if (error) {
      alert("Error submitting appointment: " + error.message);
    } else {
      alert("Appointment request submitted!");
      // Optionally clear form
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {" "}
      <h2 className="text-3xl font-semibold mb-6">
        Admin Helper - Appointment Booking
      </h2>{" "}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal details */}{" "}
        <div>
          <label className="block font-medium mb-1">Full Name</label>{" "}
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">Date of Birth</label>{" "}
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />{" "}
        </div>{" "}
        <div>
          <label className="block font-medium mb-1">Sex</label>{" "}
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Select</option>{" "}
            <option value="female">Female</option>{" "}
            <option value="male">Male</option>{" "}
            <option value="other">Other</option>{" "}
          </select>{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">ID (e.g., HKID)</label>{" "}
          <input
            type="text"
            name="id"
            value={form.id}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />{" "}
        </div>{" "}
        <div>
          <label className="block font-medium mb-1">Allergies</label>{" "}
          <textarea
            name="allergies"
            value={form.allergies}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">
            Current Medical Conditions
          </label>{" "}
          <textarea
            name="currentConditions"
            value={form.currentConditions}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">
            Past Medical Conditions
          </label>{" "}
          <textarea
            name="pastConditions"
            value={form.pastConditions}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            rows={2}
          />{" "}
        </div>
        {/* Appointment booking */}{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">
            Preferred Appointment Date
          </label>{" "}
          <input
            type="date"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="block font-medium mb-1">Preferred Time</label>{" "}
          <input
            type="time"
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />{" "}
        </div>
        {/* Permissions */}{" "}
        <div className="flex items-center space-x-4">
          {" "}
          <label className="inline-flex items-center">
            {" "}
            <input
              type="checkbox"
              name="shareHospital"
              checked={form.shareHospital}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-600"
            />{" "}
            <span className="ml-2">
              Permission to share information with hospital
            </span>{" "}
          </label>{" "}
          <label className="inline-flex items-center">
            {" "}
            <input
              type="checkbox"
              name="shareEmergency"
              checked={form.shareEmergency}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-green-600"
            />{" "}
            <span className="ml-2">
              Permission to share with emergency contacts
            </span>{" "}
          </label>{" "}
        </div>{" "}
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700"
        >
          Submit Appointment Request
        </button>{" "}
      </form>{" "}
    </div>
  );
}
