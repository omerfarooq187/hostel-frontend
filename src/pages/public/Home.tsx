// Professional Hostel Landing Page - Advertisement Focused
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState, Suspense, lazy } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import api from "../../api/axios";
import Reveal from "../../components/Reveal";
import {
  BuildingOfficeIcon, WifiIcon, ShieldCheckIcon,
  StarIcon, UserGroupIcon,
  MapPinIcon, PhoneIcon, EnvelopeIcon,
  ChevronRightIcon, CalendarIcon,
  CheckCircleIcon, ArrowRightIcon,
  HomeModernIcon, SparklesIcon,
  HeartIcon, TrophyIcon, KeyIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
  BeakerIcon,  // used for mess facility
  FireIcon,    // for gym
  BuildingLibraryIcon,
  UserCircleIcon, // for masjid
  BuildingOffice2Icon, // for branches
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

type SectionHeadingProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  eyebrow: string;
  title: ReactNode;
  description: string;
  tone?: "light" | "dark";
};

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone = "light",
}: SectionHeadingProps) {
  const isDark = tone === "dark";

  return (
    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <div
        className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 ${
          isDark
            ? "border-white/15 bg-white/10 text-white/90"
            : "border-brand-500/20 bg-brand-500/10 text-ink-900"
        }`}
      >
        <Icon className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" aria-hidden="true" />
        <span className="text-xs font-bold tracking-[0.25em] sm:text-sm">{eyebrow}</span>
      </div>
      <h2
        className={`mb-4 text-3xl font-bold sm:text-4xl ${isDark ? "text-white" : "text-ink-900"}`}
      >
        {title}
      </h2>
      <p
        className={`text-base leading-relaxed sm:text-lg ${
          isDark ? "text-white/70" : "text-gray-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

// Branch data – replacing rooms with branches
const branches = [
  {
    name: "Officers Hostel Mandra Br-1",
    location: "Thandi Sarak near UBL bank Main G.T Road, Mandra, Rawalpindi",
    features: ["Single & Double Rooms", "Mess Facility", "Gym", "Prayer Area", "24/7 Security"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    rating: 4.9,
    reviews: 156,
    capacity: "100+ Students",
    established: "2020"
  },
  {
    name: "Officers Hostel Islamabad Br-2",
    location: "Lane 10, Street 2 , Hostel City Islamabad",
    features: ["Executive Suites", "Smart Classrooms", "Library", "Cafeteria", "High-Speed WiFi"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
    rating: 5.0,
    reviews: 112,
    capacity: "100+ Students",
    established: "2023",
    featured: true
  }
];

// Testimonials – updated with Pakistani names
const testimonials = [
  {
    name: "Hamza Ahmed",
    role: "Resident at Mandra Branch",
    text: "The Officers Hostel Mandra exceeded all my expectations. The attention to detail and service is exceptional.",
    rating: 5
  },
  {
    name: "Tauqeer Zahoor",
    role: "Resident at Islamabad Branch",
    text: "Perfect blend of comfort and professionalism. The facilities in Islamabad branch are top-notch and the staff is wonderful.",
    rating: 5
  },
  {
    name: "Ahsan Shafqat",
    role: "Resident since 2023",
    text: "Best accommodation experience I've had. Highly recommended for all students across both branches.",
    rating: 5
  }
];

// Features – added Gym and Masjid, removed Luxury Bedding
const features = [
  {
    icon: ShieldCheckIcon,
    title: "24/7 Security",
    description: "Military-grade security with biometric access at both branches"
  },
  {
    icon: WifiIcon,
    title: "High-Speed Internet",
    description: "Fiber optic internet throughout premises"
  },
  {
    icon: UserGroupIcon,
    title: "Elite Community",
    description: "Network with fellow officers across all branches"
  },
  {
    icon: CalendarIcon,
    title: "Flexible Stays",
    description: "Short & long-term accommodation available"
  },
  {
    icon: TrophyIcon,
    title: "Premium Service",
    description: "Award-winning hospitality"
  },
  {
    icon: FireIcon,
    title: "Gym Facility",
    description: "Fully equipped fitness center with modern machines"
  },
  {
    icon: BeakerIcon,
    title: "Mess Facility",
    description: "Nutritious meals served three times a day in a clean dining hall"
  },
  {
    icon: BuildingLibraryIcon,
    title: "Masjid / Prayer Room",
    description: "Spacious prayer area for daily prayers and Jummah"
  },
  {
    icon: SparklesIcon,
    title: "Buffet System",
    description: "Delicious and nutritious meals with variety in our premium buffet"
  },
  {
    icon: HomeModernIcon,
    title: "Air Conditioned",
    description: "All rooms fully air-conditioned for your comfort"
  }
];

// Stats
const stats = [
  { value: "99.8%", label: "Satisfaction" },
  { value: "24/7", label: "Security" },
  { value: "350+", label: "Residents" },
  { value: "2", label: "Branches" }
];

const contactChannels = [
  {
    icon: MapPinIcon,
    title: "Officers Hostel Mandra Br-1",
    details: ["Thandi Sarak near UBL bank Mandra, Rawalpindi", "Open 24/7"],
  },
  {
    icon: MapPinIcon,
    title: "Officers Hostel Islamabad Br-2",
    details: ["Lane 10, Street 2, Hostel City Islamabad"],
  },
  {
    icon: PhoneIcon,
    title: "Call directly",
    details: ["+92 3358332755", "24/7 support"],
    href: "tel:+923358332755",
  },
  {
    icon: EnvelopeIcon,
    title: "Email us",
    details: ["admin@offhostel.org"],
    href: "mailto:admin@offhostel.org",
  },
];

const inputClasses =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-ink-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-gray-50";

// Lazy load public gallery to reuse the same component as /gallery route
const LazyPublicGallery = lazy(() => import("./Gallery"));

export default function HomePage() {
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeBranch, setActiveBranch] = useState(0);

  // Contact form state
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");

  // Subtle hero parallax. Throttled with rAF so scrolling stays smooth.
  const tickingRef = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 100);
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to contact section
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to branches section
  const scrollToBranches = () => {
    document.getElementById('branches')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Contact form handlers
  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    setContactLoading(true);
    try {
      await api.post("/api/contact", contactData);
      setContactSuccess("Message sent successfully! We'll respond within 24 hours.");
      setContactData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setContactError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="overflow-hidden bg-white font-sans">
      {/* HERO SECTION */}
      <section
        id="home"
        className="hero-offset relative flex min-h-[100svh] items-center overflow-hidden"
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-transform duration-700 ease-out ${
            scrolled ? "scale-[1.04]" : "scale-100"
          }`}
        >
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 30%" }}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.25),_transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/80 to-ink-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
        </div>

        <div className="container relative py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 shadow-lg shadow-black/20 backdrop-blur-md">
                <SparklesIcon className="h-4 w-4 text-brand-500" aria-hidden="true" />
                <span>Trusted by 350+ residents</span>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500 bg-clip-text text-transparent">
                  Officers Group of Hostels
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                A refined home away from home where premium comfort, 24/7 security, and a thriving student community come together in Mandra and Islamabad.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {['24/7 security', 'Modern rooms', 'Prime locations'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center shadow-lg shadow-black/10 backdrop-blur-md"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block text-xl font-bold text-white sm:text-2xl">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {!token ? (
                  <Link
                    to="/login"
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-600 sm:w-auto sm:px-8"
                  >
                    <span>Begin Your Experience</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 transition-transform group-hover:rotate-45 sm:h-5 sm:w-5" />
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-600 sm:w-auto sm:px-8"
                  >
                    <span>Go to Profile</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4 transition-transform group-hover:rotate-45 sm:h-5 sm:w-5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={scrollToBranches}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 sm:w-auto sm:px-8"
                >
                  <span>Explore Branches</span>
                  <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex">
              <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-400">
                    <BuildingOfficeIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                      Why residents love us
                    </p>
                    <h2 className="text-xl font-bold text-white">Everything you need, close by</h2>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {[
                    'Spacious single and double rooms',
                    'Healthy mess and fitness amenities',
                    'Quiet study-friendly environment',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"
                    >
                      <CheckCircleIcon
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-6 text-white/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                    Availability
                  </p>
                  <p className="mt-1 text-xl font-bold">Limited premium rooms this season</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 animate-bounce sm:block"
        >
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/50">
            <div className="mt-2 h-3 w-1 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* PUBLIC GALLERY PREVIEW */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-ink-900">Gallery</h2>
                <p className="text-sm text-gray-600">A selection of images and videos from our branches.</p>
              </div>
              <Link 
                to="/gallery" 
                className="text-brand-500 hover:text-brand-600 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<div className="text-center text-gray-500 py-8">Loading gallery...</div>}>
              <LazyPublicGallery preview maxItems={6} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="relative bg-white py-16 sm:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #F97316 1px, transparent 0)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container relative">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                icon={HeartIcon}
                eyebrow="OUR LEGACY"
                title={<>A Legacy of <span className="text-brand-500">Excellence</span></>}
                description="For over 15 years, we've been redefining student accommodation with a rare blend of luxury, discipline, and community."
              />
            </Reveal>

            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-3 shadow-[0_30px_80px_-30px_rgba(15,1,6,0.35)] sm:p-4">
                  <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <img
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
                      alt="Reception lounge at Officers Group of Hostels"
                      className="h-full min-h-[280px] w-full rounded-[1.5rem] object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="space-y-4">
                      <img
                        src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&q=80"
                        alt="Residents dining in the mess hall"
                        className="h-44 w-full rounded-[1.25rem] object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="relative overflow-hidden rounded-[1.25rem]">
                        <img
                          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&q=80"
                          alt="Fitness and recreation area"
                          className="h-44 w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                            Since 2020
                          </p>
                          <p className="text-lg font-bold text-white">A grounded promise</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="text-xl font-bold text-ink-900 sm:text-2xl">
                      Where tradition meets modern luxury
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
                      Designed for students who value focus, comfort, and a polished lifestyle, our spaces create the right balance of privacy and community.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      {
                        icon: ShieldCheckIcon,
                        title: 'Military-grade security',
                        description: 'Biometric access, round-the-clock surveillance, and dedicated personnel at both branches.',
                      },
                      {
                        icon: UserGroupIcon,
                        title: 'Elite community',
                        description: 'Build lasting connections with fellow students through shared spaces and events.',
                      },
                      {
                        icon: TrophyIcon,
                        title: 'Award-winning service',
                        description: 'Consistently recognized for hospitality, consistency, and resident satisfaction.',
                      },
                      {
                        icon: KeyIcon,
                        title: 'Concierge support',
                        description: 'Personalized assistance for every need, from arrival to day-to-day comfort.',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg sm:gap-4 sm:p-5"
                      >
                        <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-500 sm:p-3">
                          <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-ink-900 sm:text-base">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_100%)] py-16 sm:py-24"
      >
        <div className="container">
          <Reveal>
            <SectionHeading
              icon={StarIcon}
              eyebrow="PREMIUM FEATURES"
              title="Unmatched comfort & amenities"
              description="Every corner is designed to support focus, relaxation, and a more premium daily routine."
            />
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} className="h-full" delay={(index % 3) * 90}>
                <article className="group h-full rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-2 hover:border-brand-200 hover:shadow-card-hover sm:p-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white sm:h-14 sm:w-14">
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-ink-900 sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-7 text-gray-600 sm:text-base">
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BRANCHES SECTION */}
      <section id="branches" className="bg-white py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                icon={BuildingOffice2Icon}
                eyebrow="OUR BRANCHES"
                title="Two locations, one standard of excellence"
                description="Discover two thoughtfully designed branches that deliver the same premium experience with local character."
              />
            </Reveal>

            <Reveal>
              <div className="mb-8 rounded-[2rem] border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
                      Branch highlights
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink-900">
                      Flexible stays, premium facilities, and a warm community feel.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-brand-500/20 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
                    Both branches offer student-focused services and modern amenities.
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {branches.map((branch, index) => (
                <Reveal key={branch.name} className="h-full" delay={index * 140}>
                  <article
                    className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-white shadow-card transition-all duration-500 ${
                      index === activeBranch
                        ? "-translate-y-2 border-brand-200 shadow-card-hover"
                        : "border-gray-100 hover:-translate-y-2 hover:shadow-card-hover"
                    }`}
                    onMouseEnter={() => setActiveBranch(index)}
                    onFocus={() => setActiveBranch(index)}
                  >
                    <div className="relative h-48 overflow-hidden sm:h-64">
                      <img
                        src={branch.image}
                        alt={`${branch.name} building`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
                      {branch.featured && (
                        <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:px-4 sm:text-sm">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="text-lg font-bold text-ink-900 sm:text-xl">{branch.name}</h3>

                      <p className="mt-2 flex items-start gap-2 text-xs text-gray-500 sm:text-sm">
                        <MapPinIcon
                          className="mt-0.5 h-4 w-4 flex-none text-brand-500"
                          aria-hidden="true"
                        />
                        <span>{branch.location}</span>
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
                        <StarIconSolid className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        <span className="font-semibold text-ink-900">{branch.rating}</span>
                        <span aria-hidden="true">•</span>
                        <span>{branch.reviews} reviews</span>
                      </p>

                      <div className="mb-4 mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-gray-50 p-2 text-center">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                            Capacity
                          </div>
                          <div className="mt-1 text-sm font-semibold text-ink-900">
                            {branch.capacity}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-2 text-center">
                          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                            Established
                          </div>
                          <div className="mt-1 text-sm font-semibold text-ink-900">
                            {branch.established}
                          </div>
                        </div>
                      </div>

                      <ul className="mb-6 space-y-2">
                        {branch.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircleIcon
                              className="h-4 w-4 flex-shrink-0 text-brand-500"
                              aria-hidden="true"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={scrollToContact}
                        className="mt-auto w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-600 group-hover:shadow-lg sm:px-6 sm:py-3.5"
                      >
                        Inquire About This Branch
                      </button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section
        id="testimonials"
        className="bg-[linear-gradient(135deg,_#0F0106_0%,_#250A12_100%)] py-16 sm:py-24"
      >
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                icon={StarIcon}
                eyebrow="TESTIMONIALS"
                title="What our residents say"
                description="Real stories from students who chose comfort, security, and community."
                tone="dark"
              />
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Reveal key={testimonial.name} className="h-full" delay={index * 140}>
                  <figure className="flex h-full flex-col rounded-[1.75rem] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand-500/40 hover:bg-white/[0.14] sm:p-8">
                    <div className="mb-4 flex" aria-label={`${testimonial.rating} out of 5 stars`}>
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className="h-4 w-4 fill-current text-amber-400 sm:h-5 sm:w-5"
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    <blockquote className="relative mb-6 flex-1 sm:mb-8">
                      <span
                        aria-hidden="true"
                        className="absolute -left-2 -top-6 text-5xl text-brand-500/25"
                      >
                        &ldquo;
                      </span>
                      <p className="relative z-10 text-base leading-8 text-white/90 sm:text-lg">
                        {testimonial.text}
                      </p>
                    </blockquote>

                    <figcaption className="flex items-center gap-3 sm:gap-4">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-brand-500 bg-brand-500/20">
                        <UserCircleIcon className="h-6 w-6 text-brand-400" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-white sm:text-base">
                          {testimonial.name}
                        </span>
                        <span className="block text-xs text-white/60 sm:text-sm">
                          {testimonial.role}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="bg-white py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div className="mb-8 sm:mb-10">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-2 text-ink-900 sm:px-5 sm:py-2.5">
                    <EnvelopeIcon className="h-4 w-4 text-brand-500 sm:h-5 sm:w-5" aria-hidden="true" />
                    <span className="text-xs font-bold tracking-[0.25em] sm:text-sm">CONTACT US</span>
                  </div>
                  <h2 className="mb-4 text-3xl font-bold text-ink-900 sm:text-4xl">Get in touch</h2>
                  <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
                    Our team is ready to help you with room availability, branch details, and a smooth booking experience.
                  </p>
                </div>

                <ul className="space-y-4 sm:space-y-5">
                  {contactChannels.map((item) => {
                    const body = (
                      <>
                        <span className="rounded-xl bg-brand-500/10 p-2.5 text-brand-500 sm:p-3">
                          <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-base font-bold text-ink-900 sm:text-lg">
                            {item.title}
                          </span>
                          {item.details.map((detail) => (
                            <span
                              key={detail}
                              className="mt-1 block text-sm leading-6 text-gray-600 sm:text-base"
                            >
                              {detail}
                            </span>
                          ))}
                        </span>
                      </>
                    );

                    const className =
                      "flex items-start gap-3 rounded-[1.5rem] border border-gray-200 bg-gradient-to-r from-brand-50 to-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-md sm:gap-4 sm:p-6";

                    return (
                      <li key={item.title}>
                        {item.href ? (
                          <a href={item.href} className={className}>
                            {body}
                          </a>
                        ) : (
                          <div className={className}>{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Reveal>

              <Reveal delay={120}>
                <div className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-[0_30px_80px_-35px_rgba(15,1,6,0.25)] sm:p-8">
                  <h3 className="text-xl font-bold text-ink-900 sm:text-2xl">Send a message</h3>
                  <p className="mb-6 mt-2 text-sm leading-7 text-gray-600 sm:text-base">
                    We typically respond within 24 hours.
                  </p>

                  {contactSuccess && (
                    <div
                      role="status"
                      className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                    >
                      <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-emerald-600" aria-hidden="true" />
                      <span>{contactSuccess}</span>
                    </div>
                  )}
                  {contactError && (
                    <div
                      role="alert"
                      className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-none text-red-600" aria-hidden="true" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="mb-2 block text-sm font-semibold text-ink-900"
                        >
                          Your name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          autoComplete="name"
                          placeholder="Full name"
                          value={contactData.name}
                          onChange={handleContactChange}
                          required
                          disabled={contactLoading}
                          className={inputClasses}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="mb-2 block text-sm font-semibold text-ink-900"
                        >
                          Email address
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={contactData.email}
                          onChange={handleContactChange}
                          required
                          disabled={contactLoading}
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="mb-2 block text-sm font-semibold text-ink-900"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        name="subject"
                        placeholder="Room availability at Mandra branch"
                        value={contactData.subject}
                        onChange={handleContactChange}
                        required
                        disabled={contactLoading}
                        className={inputClasses}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="mb-2 block text-sm font-semibold text-ink-900"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        placeholder="Tell us what you're looking for..."
                        value={contactData.message}
                        onChange={handleContactChange}
                        required
                        disabled={contactLoading}
                        className={`${inputClasses} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 disabled:shadow-none disabled:hover:translate-y-0"
                    >
                      {contactLoading ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send message
                          <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="bg-[linear-gradient(135deg,_#0F0106_0%,_#2a0f1b_100%)] py-16 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                icon={SparklesIcon}
                eyebrow="WHY CHOOSE US"
                title="Why choose Officers Group?"
                description="Three generations of trust, security, and excellence in student accommodation."
                tone="dark"
              />
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {[
                { number: '5+', title: 'Years', subtitle: 'of excellence' },
                { number: '2', title: 'Branches', subtitle: 'strategic locations' },
                { number: '350+', title: 'Residents', subtitle: 'happy and growing' },
                { number: '99.8%', title: 'Satisfaction', subtitle: 'rate' },
              ].map((item, index) => (
                <Reveal key={item.title} className="h-full" delay={index * 90}>
                  <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/10 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:bg-white/15 sm:p-8">
                    <div className="mb-3 text-4xl font-black text-brand-500 sm:text-5xl">
                      {item.number}
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-white sm:text-xl">{item.title}</h3>
                    <p className="text-sm text-white/70 sm:text-base">{item.subtitle}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 to-ink-700 p-8 shadow-panel sm:p-12">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.28),transparent_55%)]"
                />

                <div className="relative">
                  <h2 className="mb-3 text-2xl font-bold text-white sm:text-4xl">
                    Ready for premium living?
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/80 sm:mb-10 sm:text-lg">
                    Join our community of ambitious residents and secure a space that feels calm, polished, and truly supportive from day one.
                  </p>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                    {!token ? (
                      <>
                        <Link
                          to="/register"
                          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-600 hover:shadow-xl sm:px-10 sm:py-4"
                        >
                          <span>Create your account</span>
                          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                        </Link>
                        <button
                          type="button"
                          onClick={scrollToContact}
                          className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/20 sm:px-10 sm:py-4"
                        >
                          <span>Contact us</span>
                          <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/profile"
                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-600 hover:shadow-xl sm:px-10 sm:py-4"
                      >
                        <span>View profile</span>
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
