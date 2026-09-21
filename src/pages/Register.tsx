import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthShell from "../components/auth/AuthShell";
import { Alert, Field, SubmitButton } from "../components/auth/FormControls";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  IdentificationIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const HIGHLIGHTS = [
  {
    icon: BuildingOffice2Icon,
    title: "Two premium branches",
    description: "Mandra and Islamabad, both built around study, comfort, and security.",
  },
  {
    icon: ClockIcon,
    title: "Apply in under a minute",
    description: "One short form is all it takes to start your accommodation request.",
  },
  {
    icon: CheckCircleIcon,
    title: "Track every step",
    description: "Follow your request from submission to room allocation in the portal.",
  },
];

const STATS = [
  { value: "350+", label: "Residents" },
  { value: "99.8%", label: "Satisfaction" },
  { value: "24/7", label: "Security" },
];

const PASSWORD_MIN_LENGTH = 6;

/** Formats 13 raw digits as the familiar XXXXX-XXXXXXX-X CNIC layout. */
function formatCnic(digits: string) {
  const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)];
  return parts.filter(Boolean).join("-");
}

/** Coarse 0–4 score used only to give the user directional feedback. */
function scorePassword(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_META = [
  { label: "Too short", bar: "bg-gray-200", text: "text-gray-500" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const strength = useMemo(() => scorePassword(password), [password]);

  // Inline validation — only surfaced once a field has been visited.
  const fieldErrors = {
    name: name.trim().length > 0 && name.trim().length < 3 ? "Please enter your full name." : "",
    email:
      email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Enter a valid email address."
        : "",
    cnic: cnic.length > 0 && cnic.length < 13 ? "CNIC must be exactly 13 digits." : "",
    password:
      password.length > 0 && password.length < PASSWORD_MIN_LENGTH
        ? `Use at least ${PASSWORD_MIN_LENGTH} characters.`
        : "",
    confirmPassword:
      confirmPassword.length > 0 && confirmPassword !== password
        ? "Passwords do not match."
        : "",
  };

  const errorFor = (field: keyof typeof fieldErrors) =>
    touched[field] ? fieldErrors[field] : "";

  const markTouched = (field: string) =>
    setTouched((previous) => ({ ...previous, [field]: true }));

  const isComplete =
    name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    cnic.length === 13 &&
    password.length >= PASSWORD_MIN_LENGTH &&
    confirmPassword === password;

  // CNIC input accepts digits only, capped at 13.
  const handleCnicChange = (e) => {
    setCnic(e.target.value.replace(/\D/g, "").slice(0, 13));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setTouched({
      name: true,
      email: true,
      cnic: true,
      password: true,
      confirmPassword: true,
    });

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
      return;
    }

    if (cnic.length !== 13) {
      setError("CNIC must be exactly 13 digits");
      return;
    }

    setLoading(true);

    try {
      // Backend returns: { "message": "Account created successfully" }
      const response = await api.post("/api/auth/signup", {
        name: name.trim(),
        email: email.trim(),
        cnic,
        password,
      });

      setSuccess(
        response.data?.message || "Account created successfully! You can now log in."
      );

      // Automatically redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === "object" && errorData.message) {
        setError(errorData.message);
      } else if (typeof errorData === "string") {
        setError(errorData);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      heading="Start your application for a room."
      description="Register once, then apply, track your request, and manage your stay from a single dashboard."
      highlights={HIGHLIGHTS}
      stats={STATS}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Create your account</h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Register to request hostel accommodation.
        </p>
      </div>

      {success && (
        <Alert tone="success" title="Registration successful">
          <p>{success}</p>
          <p className="mt-1">Taking you to the sign-in page…</p>
          <Link
            to="/login"
            className="mt-3 inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:text-emerald-900"
          >
            Go to sign in
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Alert>
      )}

      {error && (
        <Alert tone="error" title="We couldn't create your account">
          {error}
        </Alert>
      )}

      {!success && (
        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          <Field
            label="Full name"
            icon={UserIcon}
            name="name"
            autoComplete="name"
            placeholder="e.g. Hamza Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched("name")}
            error={errorFor("name")}
            required
            disabled={loading}
          />

          <Field
            label="Email address"
            icon={EnvelopeIcon}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched("email")}
            error={errorFor("email")}
            required
            disabled={loading}
          />

          <Field
            label="CNIC number"
            icon={IdentificationIcon}
            name="cnic"
            inputMode="numeric"
            autoComplete="off"
            placeholder="35202-1234567-1"
            value={formatCnic(cnic)}
            onChange={handleCnicChange}
            onBlur={() => markTouched("cnic")}
            error={errorFor("cnic")}
            hint="13 digits, dashes added automatically."
            required
            disabled={loading}
            trailing={
              <span
                className={`px-2 text-xs font-semibold tabular-nums ${
                  cnic.length === 13 ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {cnic.length}/13
              </span>
            }
          />

          <div>
            <Field
              label="Password"
              icon={LockClosedIcon}
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              error={errorFor("password")}
              hint={`At least ${PASSWORD_MIN_LENGTH} characters. Mix letters, numbers, and symbols.`}
              required
              disabled={loading}
              revealable
            />

            {password.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-1 gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        step <= strength ? STRENGTH_META[strength].bar : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span
                  aria-live="polite"
                  className={`w-16 text-right text-xs font-semibold ${STRENGTH_META[strength].text}`}
                >
                  {STRENGTH_META[strength].label}
                </span>
              </div>
            )}
          </div>

          <Field
            label="Confirm password"
            icon={LockClosedIcon}
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => markTouched("confirmPassword")}
            error={errorFor("confirmPassword")}
            required
            disabled={loading}
            revealable
            trailing={
              confirmPassword.length > 0 && confirmPassword === password ? (
                <CheckCircleIcon
                  className="h-5 w-5 text-emerald-500"
                  aria-label="Passwords match"
                />
              ) : null
            }
          />

          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-sm font-semibold text-ink-900">Before you continue</p>
            <ul className="mt-2 space-y-1.5">
              {[
                "You can sign in as soon as your account is created.",
                "An admin approves your request before room allocation.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-5 text-gray-600">
                  <CheckCircleIcon
                    className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-500"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <SubmitButton
            loading={loading}
            loadingLabel="Creating account..."
            disabled={!isComplete}
          >
            Create account
            <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </SubmitButton>

          <p className="text-center text-xs leading-5 text-gray-500">
            By creating an account you agree to our{" "}
            <Link to="/terms" className="font-medium text-brand-600 hover:text-brand-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-medium text-brand-600 hover:text-brand-700">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}

      <p className="mt-6 text-center text-[15px] text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
