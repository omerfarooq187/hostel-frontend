import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Change background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Detect which section is currently in view (only on home page)
      if (location.pathname === "/") {
        const sections = [
          { id: "home", offset: 0 },
          { id: "about", offset: 100 },
          { id: "branches", offset: 100 },
          { id: "contact", offset: 100 }
        ];
        
        const scrollPosition = window.scrollY + 150; // Offset for navbar
        
        // Check if we're at the very top (home section)
        if (scrollPosition < 200) {
          setActiveSection("home");
          return;
        }
        
        // Check other sections
        for (const section of sections.slice(1)) { // Skip home
          const element = document.getElementById(section.id);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Force solid background on authentication-related pages
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/verify-email") ||
    location.pathname.startsWith("/forgot-password") ||
    location.pathname.startsWith("/reset-password");

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon, section: "home", exact: true },
    { name: "About", path: "/", icon: InformationCircleIcon, section: "about", hash: true },
    { name: "Branches", path: "/", icon: StarIcon, section: "branches", hash: true },
    { name: "Contact", path: "/", icon: EnvelopeIcon, section: "contact", hash: true },
  ];

  const handleHashScroll = (e, section) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (location.pathname !== "/") {
      // If not on home page, navigate to home first
      window.location.href = `/#${section}`;
    } else {
      // On home page - smooth scroll
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(section);
      }
    }
  };

  const isLinkActive = (link) => {
    // If not on home page, only Home can be active if path matches
    if (location.pathname !== "/") {
      return link.path === location.pathname;
    }
    
    // On home page
    if (link.section === "home") {
      // Home is only active when no other section is active AND we're at the top
      return activeSection === "home" && window.scrollY < 100;
    } else {
      // Other sections are active when they're in view
      return activeSection === link.section;
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
            onClick={() => {
              setIsOpen(false);
              setActiveSection("home");
              if (location.pathname === "/") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img 
              src={logo} 
              alt="OGOH Logo" 
              className="h-10 w-auto sm:h-12 md:h-14"
            />
            <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold whitespace-nowrap text-[#FF6B00]">
              Officers Group of Hostels
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              if (link.hash) {
                return (
                  <a
                    key={link.name}
                    href={`/#${link.section}`}
                    onClick={(e) => handleHashScroll(e, link.section)}
                    className={`relative font-medium transition-colors group text-sm lg:text-base cursor-pointer ${
                      scrolled || isAuthPage
                        ? isLinkActive(link)
                          ? "text-[#FF6B00]"
                          : "text-gray-700 hover:text-[#FF6B00]"
                        : isLinkActive(link)
                          ? "text-[#FF6B00]"
                          : "text-white/90 hover:text-[#FF6B00]"
                    }`}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
                  </a>
                );
              } else {
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.exact}
                    className={({ isActive: isRouteActive }) => 
                      `relative font-medium transition-colors group text-sm lg:text-base ${
                        scrolled || isAuthPage
                          ? (isRouteActive && isLinkActive(link))
                            ? "text-[#FF6B00]"
                            : "text-gray-700 hover:text-[#FF6B00]"
                          : (isRouteActive && isLinkActive(link))
                            ? "text-[#FF6B00]"
                            : "text-white/90 hover:text-[#FF6B00]"
                      }`
                    }
                    onClick={() => {
                      setIsOpen(false);
                      setActiveSection("home");
                      if (location.pathname === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
                  </NavLink>
                );
              }
            })}
            
            {!token ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => 
                    `relative font-medium transition-colors group text-sm lg:text-base ${
                      scrolled || isAuthPage
                        ? isActive ? "text-[#FF6B00]" : "text-gray-700 hover:text-[#FF6B00]"
                        : isActive ? "text-[#FF6B00]" : "text-white/90 hover:text-[#FF6B00]"
                    }`
                  }
                >
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors shadow-md text-sm lg:text-base"
                >
                  Register
                </NavLink>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => 
                    `relative font-medium transition-colors group text-sm lg:text-base ${
                      scrolled || isAuthPage
                        ? isActive ? "text-[#FF6B00]" : "text-gray-700 hover:text-[#FF6B00]"
                        : isActive ? "text-[#FF6B00]" : "text-white/90 hover:text-[#FF6B00]"
                    }`
                  }
                >
                  Profile
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
                <button
                  onClick={logout}
                  className={`relative flex items-center gap-1 transition-colors group text-sm lg:text-base ${
                    scrolled || isAuthPage
                      ? "text-gray-700 hover:text-[#FF6B00]"
                      : "text-white/90 hover:text-[#FF6B00]"
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span>Logout</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B00] transition-all duration-300 group-hover:w-full"></span>
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
            {navLinks.map((link) => {
              if (link.hash) {
                return (
                  <a
                    key={link.name}
                    href={`/#${link.section}`}
                    onClick={(e) => {
                      handleHashScroll(e, link.section);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors relative group text-sm sm:text-base cursor-pointer ${
                      isLinkActive(link)
                        ? "text-[#FF6B00] bg-orange-50"
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
                    }`}
                  >
                    <link.icon className="h-5 w-5 sm:h-5 sm:w-5" />
                    {link.name}
                    <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                  </a>
                );
              } else {
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.exact}
                    onClick={() => {
                      setIsOpen(false);
                      setActiveSection("home");
                      if (location.pathname === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={({ isActive: isRouteActive }) => 
                      `flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors relative group text-sm sm:text-base ${
                        (isRouteActive && isLinkActive(link))
                          ? "text-[#FF6B00] bg-orange-50"
                          : "text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
                      }`
                    }
                  >
                    <link.icon className="h-5 w-5 sm:h-5 sm:w-5" />
                    {link.name}
                    <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                  </NavLink>
                );
              }
            })}
            
            {!token ? (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors relative group text-sm sm:text-base ${
                      isActive 
                        ? "text-[#FF6B00] bg-orange-50" 
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
                    }`
                  }
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Login
                  <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors relative group text-sm sm:text-base ${
                      isActive 
                        ? "text-[#FF6B00] bg-orange-50" 
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
                    }`
                  }
                >
                  <UserPlusIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Register
                  <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 transition-colors relative group text-sm sm:text-base ${
                      isActive 
                        ? "text-[#FF6B00] bg-orange-50" 
                        : "text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00]"
                    }`
                  }
                >
                  <UserIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Profile
                  <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 hover:bg-orange-50 hover:text-[#FF6B00] transition-colors w-full text-left relative group text-sm sm:text-base"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-5 sm:w-5" />
                  Logout
                  <span className="absolute left-0 w-1 h-0 bg-[#FF6B00] transition-all duration-300 group-hover:h-full"></span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}