import { Link } from "react-router-dom";
import type { ComponentType, ReactNode, SVGProps } from "react";
import logo from "../../assets/ogoh_logo.png";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

type Highlight = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

type AuthShellProps = {
  eyebrow: string;
  heading: string;
  description: string;
  highlights: Highlight[];
  stats?: { value: string; label: string }[];
  children: ReactNode;
};

/**
 * Split-screen shell shared by the sign-in and sign-up pages: a dark brand
 * panel on large screens, the form on the right, and a compact brand header
 * stacked above the form on mobile.
 */
export default function AuthShell({
  eyebrow,
  heading,
  description,
  highlights,
  stats,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f5] px-4 pb-12 pt-20 sm:px-6 md:pt-28">
      {/* Ambient brand wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(249,115,22,0.16),transparent_45%),radial-gradient(circle_at_85%_100%,rgba(15,1,6,0.10),transparent_45%)]"
      />

      <div className="container relative">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_40px_90px_-45px_rgba(15,1,6,0.45)]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            {/* Brand panel — desktop only */}
            <aside className="relative hidden flex-col justify-between bg-[linear-gradient(150deg,#0f0106_0%,#2a0f1b_55%,#3b1410_100%)] p-10 lg:flex">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative">
                <Link to="/" className="inline-flex items-center gap-3">
                  <img src={logo} alt="" className="h-11 w-auto" />
                  <span className="text-lg font-bold leading-tight text-white">
                    Officers Group
                    <span className="block text-sm font-medium text-white/60">
                      of Hostels
                    </span>
                  </span>
                </Link>

                <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
                  {eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-white">
                  {heading}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/70">{description}</p>

                <ul className="mt-9 space-y-4">
                  {highlights.map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/10 text-brand-400 ring-1 ring-inset ring-white/10">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-sm leading-6 text-white/60">
                          {item.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {stats && stats.length > 0 && (
                <div className="relative mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

            {/* Form panel */}
            <div className="p-6 sm:p-10">
              {/* Compact brand header — mobile only */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <img src={logo} alt="" className="h-12 w-auto" />
                <div>
                  <p className="text-sm font-bold leading-tight text-ink-900">
                    Officers Group of Hostels
                  </p>
                  <p className="text-xs text-gray-500">{eyebrow}</p>
                </div>
              </div>

              {children}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-brand-600"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to website
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircleIcon className="h-4 w-4 text-brand-500" />
                  Secured connection
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Officers Group of Hostels. All rights reserved.
        </p>
      </div>
    </div>
  );
}
