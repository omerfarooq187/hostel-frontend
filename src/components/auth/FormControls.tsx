import { useId, useState } from "react";
import type { ComponentType, InputHTMLAttributes, ReactNode, SVGProps } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Validation message. Shown, and wires up aria-invalid, when truthy. */
  error?: string;
  /** Helper text shown when there's no error. */
  hint?: ReactNode;
  /** Right-aligned adornment next to the label, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
  /** Renders a show/hide toggle and swaps the input type. */
  revealable?: boolean;
  /** Small status shown at the right edge of the input. */
  trailing?: ReactNode;
};

export function Field({
  label,
  icon: Icon,
  error,
  hint,
  labelAction,
  revealable = false,
  trailing,
  type = "text",
  id,
  ...inputProps
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedById = `${fieldId}-description`;
  const [revealed, setRevealed] = useState(false);

  const resolvedType = revealable ? (revealed ? "text" : "password") : type;
  const hasTrailing = revealable || Boolean(trailing);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm font-semibold text-ink-900">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className={`pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
            error ? "text-red-400" : "text-gray-400"
          }`}
        />

        <input
          {...inputProps}
          id={fieldId}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? describedById : undefined}
          className={`w-full rounded-xl border bg-white py-3 pl-11 text-[15px] text-ink-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
            hasTrailing ? "pr-24" : "pr-4"
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-gray-200 hover:border-gray-300 focus:border-brand-500 focus:ring-brand-100"
          }`}
        />

        {hasTrailing && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {trailing}
            {revealable && (
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-label={revealed ? "Hide password" : "Show password"}
                aria-pressed={revealed}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                {revealed ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {(error || hint) && (
        <p
          id={describedById}
          className={`mt-1.5 flex items-start gap-1.5 text-xs leading-5 ${
            error ? "text-red-600" : "text-gray-500"
          }`}
        >
          {error && (
            <ExclamationCircleIcon className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden="true" />
          )}
          <span>{error || hint}</span>
        </p>
      )}
    </div>
  );
}

type AlertProps = {
  tone: "error" | "success";
  title: string;
  children?: ReactNode;
};

export function Alert({ tone, title, children }: AlertProps) {
  const isError = tone === "error";
  const Icon = isError ? ExclamationCircleIcon : CheckCircleIcon;

  return (
    <div
      role="alert"
      aria-live={isError ? "assertive" : "polite"}
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50/80"
          : "border-emerald-200 bg-emerald-50/80"
      }`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 h-5 w-5 flex-none ${
          isError ? "text-red-600" : "text-emerald-600"
        }`}
      />
      <div className="min-w-0">
        <p
          className={`text-sm font-semibold ${
            isError ? "text-red-900" : "text-emerald-900"
          }`}
        >
          {title}
        </p>
        {children && (
          <div
            className={`mt-1 text-sm leading-6 ${
              isError ? "text-red-700" : "text-emerald-700"
            }`}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

type SubmitButtonProps = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
  disabled?: boolean;
};

export function SubmitButton({
  loading,
  loadingLabel,
  children,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:hover:translate-y-0"
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
