import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("Login error: " + error.message);
    } else {
      alert("Login successful!");
      navigate("/"); // redirect to home or dashboard
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring focus:ring-teal-400"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <span>Don't have an account? </span>
          <button
            className="text-teal-700 underline font-medium"
            onClick={() => navigate("/register")}
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}
