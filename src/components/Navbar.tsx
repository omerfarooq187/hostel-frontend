import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ogoh_logo.png";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  InformationCircleIcon,
  StarIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const { token, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Change background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force solid background on authentication-related pages
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/dashboard");

  const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "About", href: "/#about", icon: InformationCircleIcon },
    { name: "Rooms", href: "/#rooms", icon: StarIcon },
    { name: "Contact", href: "/#contact", icon: EnvelopeIcon },
  ];

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || isAuthPage ? "bg-white shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo + Brand Name */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3"
            onClick={() => setIsOpen(false)}
          >
            {/* Responsive logo size */}
            <img 
              src={logo} 
              alt="OGOH Logo" 
              className="h-8 w-auto sm:h-10 md:h-12"
            />
            {/* Responsive text size - full orange color */}
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold whitespace-nowrap text-[#F97316]">
              Officers Group of Hostels
            </span>
          </Link>

          {/* Desktop Menu - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className={`relative font-medium transition-colors group text-sm lg:text-base ${
                  scrolled || isAuthPage
                    ? "text-gray-700"
                    : "text-white/90"
                }`}
              >
                {link.name}
                {/* Orange underline on hover */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            {!token ? (
              <>
                <Link
                  to="/login"
                  className={`relative font-medium transition-colors group text-sm lg:text-base ${
                    scrolled || isAuthPage
                      ? "text-gray-700"
                      : "text-white/90"
                  }`}
                >
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors shadow-md text-sm lg:text-base"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className={`relative font-medium transition-colors group text-sm lg:text-base ${
                    scrolled || isAuthPage
                      ? "text-gray-700"
                      : "text-white/90"
                  }`}
                >
                  Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <button
                  onClick={logout}
                  className={`relative flex items-center gap-1 transition-colors group text-sm lg:text-base ${
                    scrolled || isAuthPage
                      ? "text-gray-700"
                      : "text-white/90"
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span>Logout</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] transition-all duration-300 group-hover:w-full"></span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <XMarkIcon className={`h-6 w-6 ${scrolled || isAuthPage ? "text-gray-900" : "text-white"}`} />
            ) : (
              <Bars3Icon className={`h-6 w-6 ${scrolled || isAuthPage ? "text-gray-900" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg sm:text-xl font-bold text-gray-900">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors relative group text-sm sm:text-base"
              >
                <link.icon className="h-5 w-5 sm:h-5 sm:w-5" />
                {link.name}
                <span className="absolute left-0 w-1 h-0 bg-[#F97316] transition-all duration-300 group-hover:h-full"></span>
              </a>
            ))}
            {!token ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors relative group text-sm sm:text-base"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Login
                  <span className="absolute left-0 w-1 h-0 bg-[#F97316] transition-all duration-300 group-hover:h-full"></span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors relative group text-sm sm:text-base"
                >
                  <UserPlusIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Register
                  <span className="absolute left-0 w-1 h-0 bg-[#F97316] transition-all duration-300 group-hover:h-full"></span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors relative group text-sm sm:text-base"
                >
                  <UserIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Profile
                  <span className="absolute left-0 w-1 h-0 bg-[#F97316] transition-all duration-300 group-hover:h-full"></span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors w-full text-left relative group text-sm sm:text-base"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Logout
                  <span className="absolute left-0 w-1 h-0 bg-[#F97316] transition-all duration-300 group-hover:h-full"></span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}