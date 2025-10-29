import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  onSuccess?: () => void;
};

const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;

const Login: React.FC<Props> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email || !emailRegex.test(email)) return "Please enter a valid email.";
    if (!password || password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.message || "Failed to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm"
    >
      <h2 className="text-xl font-semibold text-white">Login</h2>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <div>
        <label className="block text-gray-300 text-sm mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-gray-700 text-white p-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-gray-300 text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md bg-gray-700 text-white p-2 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium py-2 rounded-md"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default Login;
