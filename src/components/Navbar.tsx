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
        window.location.href = href; // fallback navigation
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled || isAuthPage ? "bg-[#0F0106] shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo + Brand Name - combined for better layout */}
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            {/* Logo image – place the file in public/assets/ and use absolute path */}
            <img 
              src={logo} 
              alt="OGOH Logo" 
              className="h-10 w-auto" // adjust height as needed
            />
            <span className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">
              Officers Group of <span className="text-[#B58E67]">Hostels</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-white/90 hover:text-[#B58E67] transition-colors font-medium"
              >
                {link.name}
              </a>
            ))}
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="text-white/90 hover:text-[#B58E67] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-[#B58E67] hover:bg-[#a07954] text-white rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-white/90 hover:text-[#B58E67] transition-colors font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 text-white/90 hover:text-[#B58E67] transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu (unchanged, works) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#0F0106] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="text-xl font-bold text-white">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white/70 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-[#B58E67] transition-colors"
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </a>
            ))}
            {!token ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-[#B58E67] transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-[#B58E67] transition-colors"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-[#B58E67] transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-[#B58E67] transition-colors w-full text-left"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}