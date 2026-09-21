import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/auth/AuthShell";
import { Alert, Field, SubmitButton } from "../components/auth/FormControls";
import {
  ArrowRightIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const HIGHLIGHTS = [
  {
    icon: ShieldCheckIcon,
    title: "Secure resident portal",
    description: "Your allocation, fees, and documents in one protected place.",
  },
  {
    icon: SparklesIcon,
    title: "Everything at a glance",
    description: "Track dues, room details, and requests without a single phone call.",
  },
  {
    icon: UserGroupIcon,
    title: "Support that answers",
    description: "Reach the branch team directly, any hour of the day.",
  },
];

const STATS = [
  { value: "350+", label: "Residents" },
  { value: "2", label: "Branches" },
  { value: "24/7", label: "Support" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        email: email.trim(),
        password,
      });

      // store token via context
      login(res.data.token, res.data.role);

      // redirect by role
      if (res.data.role === "ADMIN" || res.data.role === "STAFF") {
        navigate("/admin/login");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Resident portal"
      heading="Welcome back to your home away from home."
      description="Sign in to manage your room, view your fee status, and stay connected with your branch team."
      highlights={HIGHLIGHTS}
      stats={STATS}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Enter your credentials to access your account.
        </p>
      </div>

      {error && (
        <Alert tone="error" title="We couldn't sign you in">
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-5" noValidate>
        <Field
          label="Email address"
          icon={EnvelopeIcon}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Field
          label="Password"
          icon={LockClosedIcon}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          revealable
          labelAction={
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Forgot password?
            </Link>
          }
        />

        <SubmitButton
          loading={loading}
          loadingLabel="Signing in..."
          disabled={!email.trim() || !password}
        >
          Sign in
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-[15px] text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
