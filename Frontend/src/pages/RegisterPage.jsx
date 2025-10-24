import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Sign-up error: " + error.message);
      return;
    }

    // Insert profile after successful sign-up
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id, // use auth user id as PK in profiles
          email: email,
          name: name,
          dob: dob,
          sex: sex,
        },
      ]);

      if (profileError) {
        alert("Profile creation error: " + profileError.message);
        return;
      }
    }

    alert("Registration successful! Please verify your email.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Date of Birth</label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Sex</label>
            <select
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="" disabled>
                Select your sex
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Create Account
          </button>
        </form>
        <div className="mt-6 text-center">
          <span>Already have an account? </span>
          <button
            className="text-teal-700 underline font-medium"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
