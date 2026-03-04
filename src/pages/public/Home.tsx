// HomePage.jsx - Hostel Concept (No Pricing, Mess Facility Integrated, Contact Form)
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { 
  BuildingOfficeIcon, WifiIcon, ShieldCheckIcon, 
  StarIcon, UserGroupIcon, 
  MapPinIcon, PhoneIcon, EnvelopeIcon, 
  ChevronRightIcon, CalendarIcon,
  CheckCircleIcon, ArrowRightIcon,
  HomeModernIcon, SparklesIcon,
  HeartIcon, TrophyIcon, KeyIcon,
  TvIcon, DevicePhoneMobileIcon,
  ArrowTopRightOnSquareIcon,
  BeakerIcon,  // used for mess facility
  FireIcon,    // for gym
  BuildingLibraryIcon,
  UserCircleIcon, // for masjid
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const BedIcon = ({ className = "h-6 w-6" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 14h14M5 17v-4m14 4v-4m-7-7v4m0-4h3m-3 0H8m8 8H8m8 0v2M8 17v2"
    />
  </svg>
);

export default function HomePage() {
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeRoom, setActiveRoom] = useState(0);

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
  
  // Room data – prices removed
  const rooms = [
    {
      type: "Standard Suite",
      features: ["Single Bed", "Private Bathroom", "Wi-Fi 6", "Smart AC"],
      amenities: ["Wifi", "TV", "AC", "Security"],
      image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      rating: 4.8,
      reviews: 124
    },
    {
      type: "Deluxe Room",
      features: ["Double Bed", "Ensuite Bath", "Smart TV", "Mini-bar"],
      amenities: ["Wifi", "TV", "AC", "Bar", "Room Service"],
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80",
      rating: 4.9,
      reviews: 89,
      featured: true
    },
    {
      type: "Executive Suite",
      features: ["King Bed", "Living Area", "Kitchenette", "Private Balcony"],
      amenities: ["Wifi", "TV", "AC", "Kitchen", "Balcony", "Workspace"],
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
      rating: 5.0,
      reviews: 67
    }
  ];
  
  // Testimonials – updated with Pakistani names
  const testimonials = [
    {
      name: "Hamza Ahmed",
      role: "Resident since 2022",
      text: "The Officers Hostel exceeded all my expectations. The attention to detail and service is exceptional.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop"
    },
    {
      name: "Tauqeer Zahoor",
      role: "Resident since 2021",
      text: "Perfect blend of comfort and professionalism. The facilities are top-notch and the staff is wonderful.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80&auto=format&fit=crop"
    },
    {
      name: "Ahsan Shafqat",
      role: "Resident since 2023",
      text: "Best accommodation experience I've had. Highly recommended for all students.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop"
    }
  ];
  
  // Features – added Gym and Masjid, removed Luxury Bedding
  const features = [
    {
      icon: ShieldCheckIcon,
      title: "24/7 Security",
      description: "Military-grade security with biometric access"
    },
    {
      icon: WifiIcon,
      title: "High-Speed Internet",
      description: "Fiber optic internet throughout premises"
    },
    {
      icon: UserGroupIcon,
      title: "Elite Community",
      description: "Network with fellow officers"
    },
    {
      icon: CalendarIcon,
      title: "Flexible Stays",
      description: "Short & long-term accommodation"
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
    }
  ];

  // Stats
  const stats = [
    { value: "99.8%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Security" },
    { value: "300+", label: "Happy Residents" },
    { value: "5+", label: "Years Experience" }
  ];

  // Handle scroll for animations
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      
      // Auto-rotate rooms on scroll
      const scrollPosition = window.pageYOffset;
      const roomSection = document.getElementById('rooms');
      if (roomSection) {
        const roomPosition = roomSection.offsetTop;
        if (scrollPosition > roomPosition - 500) {
          const roomIndex = Math.floor((scrollPosition - roomPosition + 500) / 300) % rooms.length;
          setActiveRoom(roomIndex);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to contact section
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="bg-white font-sans overflow-hidden">
      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center hero-offset">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80"
            alt="Luxury Hostel Interior"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0106]/90 via-[#0F0106]/70 to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to
              <br />
              <span className="text-[#F97316]">Officers Group of Hostels</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-10 max-w-xl leading-relaxed">
              Experience premium accommodation designed for officers with world-class 
              amenities and exceptional service in a secure, professional environment.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {!token ? (
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0F0106] hover:bg-[#F97316] text-white rounded-btn font-bold transition-all duration-300 hover:shadow-xl w-full sm:w-auto animate-fade-in-up"
                  style={{ animationDelay: '400ms' }}
                >
                  <span>Begin Your Experience</span>
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0F0106] hover:bg-[#F97316] text-white rounded-btn font-bold transition-all duration-300 hover:shadow-xl w-full sm:w-auto animate-fade-in-up"
                  style={{ animationDelay: '400ms' }}
                >
                  <span>Go to Profile</span>
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                </Link>
              )}
              
              <button
                onClick={() => {
                  const rooms = document.getElementById('rooms');
                  rooms?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white rounded-btn font-bold transition-all duration-300 w-full sm:w-auto backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: '500ms' }}
              >
                <span>Explore Rooms</span>
                <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* ABOUT SECTION */}
      <section id="about" className="py-24 bg-white relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #F97316 1px, transparent 0)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316]/10 text-[#0F0106] rounded-full mb-6 border border-[#F97316]/20">
                <HeartIcon className="h-5 w-5 text-[#F97316]" />
                <span className="text-sm font-bold tracking-wider">OUR LEGACY</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F0106] mb-6">
                A Legacy of{" "}
                <span className="text-[#F97316]">Excellence</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                For over 15 years, we've been redefining officer accommodation with an unwavering 
                commitment to luxury, security, and community.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image Gallery */}
              <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <img
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"
                      alt="Lobby"
                      className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80"
                      alt="Dining"
                      className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    />
                  </div>
                  <div className="space-y-6 pt-12">
                    <img
                      src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80"
                      alt="Gym"
                      className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    />
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80"
                        alt="Pool"
                        className="rounded-2xl shadow-lg"
                      />
                      <div className="absolute -bottom-4 -right-4 bg-[#0F0106] text-white px-6 py-4 rounded-2xl shadow-xl">
                        <div className="text-2xl font-bold">2022</div>
                        <div className="text-sm opacity-90">Established</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-2xl font-bold text-[#0F0106]">
                  Where Tradition Meets Modern Luxury
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: ShieldCheckIcon,
                      title: "Military-Grade Security",
                      description: "Biometric access, 24/7 surveillance, and dedicated security personnel"
                    },
                    {
                      icon: UserGroupIcon,
                      title: "Elite Community",
                      description: "Network with fellow officers in exclusive social events"
                    },
                    {
                      icon: TrophyIcon,
                      title: "Award-Winning Service",
                      description: "Consistently recognized for exceptional hospitality"
                    },
                    {
                      icon: KeyIcon,
                      title: "Concierge Service",
                      description: "Personalized assistance for all your needs"
                    }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F97316]/5 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="p-3 bg-[#F97316]/10 rounded-lg group-hover:bg-[#F97316]/20 transition-colors">
                        <item.icon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0F0106] mb-1">{item.title}</h4>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316]/10 text-[#0F0106] rounded-full mb-6 border border-[#F97316]/20">
              <StarIcon className="h-5 w-5 text-[#F97316]" />
              <span className="text-sm font-bold tracking-wider">PREMIUM FEATURES</span>
            </div>
            <h2 className="text-4xl font-bold text-[#0F0106] mb-6">
              Unmatched Comfort & Amenities
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 bg-[#F97316]/10 text-[#F97316] rounded-xl w-fit mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0106] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ROOMS SECTION */}
      <section id="rooms" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316]/10 text-[#0F0106] rounded-full mb-6 border border-[#F97316]/20">
                <HomeModernIcon className="h-5 w-5 text-[#F97316]" />
                <span className="text-sm font-bold tracking-wider">ACCOMMODATION</span>
              </div>
              <h2 className="text-4xl font-bold text-[#0F0106] mb-6">
                Our Premium Rooms
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Each suite is meticulously designed to provide the perfect balance of comfort, 
                functionality, and elegance.
              </p>
            </div>
            
            {/* Rooms Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                    index === activeRoom ? 'transform -translate-y-4' : 'hover:-translate-y-2'
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 200}ms` }}
                  onMouseEnter={() => setActiveRoom(index)}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.type}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {room.featured && (
                      <div className="absolute top-4 left-4">
                        {/* "MOST POPULAR" badge removed */}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#0F0106] mb-1">
                          {room.type}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <StarIconSolid className="h-4 w-4 text-yellow-400" />
                          <span>{room.rating}</span>
                          <span>•</span>
                          <span>{room.reviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {room.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-[#F97316]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Inquire button */}
                    <button
                      onClick={scrollToContact}
                      className="block w-full px-6 py-3 bg-[#0F0106] hover:bg-[#F97316] text-white rounded-btn font-bold transition-all duration-300 text-center group-hover:shadow-lg"
                    >
                      Inquire Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-[#0F0106]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316]/20 text-white rounded-full mb-6 border border-[#F97316]/30">
                <StarIcon className="h-5 w-5 text-[#F97316]" />
                <span className="text-sm font-bold tracking-wider">TESTIMONIALS</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                What Our Residents Say
              </h2>
            </div>
            
            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-[#F97316]/30 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <div className="relative mb-8">
                  <div className="text-5xl text-[#F97316]/20 absolute -top-4 -left-2">"</div>
                  <p className="text-white/90 italic text-lg relative z-10">
                    {testimonial.text}
                  </p>
                </div>
                
                {/* Author - now using icon instead of image */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F97316]/20 border-2 border-[#F97316] flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-[#F97316]" />
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-white/60 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <div className="animate-fade-in-up">
                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F97316]/10 text-[#0F0106] rounded-full mb-6 border border-[#F97316]/20">
                    <EnvelopeIcon className="h-5 w-5 text-[#F97316]" />
                    <span className="text-sm font-bold tracking-wider">CONTACT US</span>
                  </div>
                  <h2 className="text-4xl font-bold text-[#0F0106] mb-6">
                    Get In Touch
                  </h2>
                  <p className="text-gray-600">
                    Our team is ready to assist you with personalized service 
                    and attention to detail.
                  </p>
                </div>
                
                <div className="space-y-8">
                  {[
                    {
                      icon: MapPinIcon,
                      title: "Visit Our Campus",
                      details: ["Main G.T Road ", "Mandra, Rawalpindi", "Open 24/7"],
                    },
                    {
                      icon: PhoneIcon,
                      title: "Call Directly",
                      details: ["+92 3358332755", "24/7 Support"],
                    },
                    {
                      icon: EnvelopeIcon,
                      title: "Email Us",
                      details: ["admin@offhostel.org"],
                    }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-6 rounded-xl border border-gray-200 hover:border-[#F97316]/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-3 bg-[#F97316]/10 rounded-lg">
                        <item.icon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0F0106] mb-2">
                          {item.title}
                        </h3>
                        <div className="space-y-1">
                          {item.details.map((detail, idx) => (
                            <p key={idx} className="text-gray-600">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-2xl font-bold text-[#0F0106] mb-2">
                  Send a Message
                </h3>
                <p className="text-gray-600 mb-8">
                  We'll respond within 24 hours
                </p>

                {/* Success/Error Messages */}
                {contactSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    {contactSuccess}
                  </div>
                )}
                {contactError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {contactError}
                  </div>
                )}
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={contactData.name}
                        onChange={handleContactChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={contactData.email}
                        onChange={handleContactChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={contactData.subject}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      rows="4"
                      value={contactData.message}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full px-6 py-3 bg-[#0F0106] hover:bg-[#F97316] text-white rounded-btn font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contactLoading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}