import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCoffee,
  FiHeart,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiUsers,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeImpact, setActiveImpact] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Rotate through impact stats
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImpact((prev) => (prev + 1) % impactStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const impactStats = [
    { number: "150K+", label: "Volunteer Hours", icon: <FiClock /> },
    { number: "5,000+", label: "Events Organized", icon: <FiCalendar /> },
    { number: "30K+", label: "Active Volunteers", icon: <FiUsers /> },
    { number: "800+", label: "Communities Served", icon: <FiMapPin /> },
  ];

  const categories = [
    "All",
    "Environmental",
    "Community Support",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Food Donation",
  ];

  const featuredEvents = [
    {
      id: 1,
      title: "Community Beach Cleanup",
      category: "Environmental",
      date: "Next Saturday, 9:00 AM",
      location: "Main City Beach",
      spots: 12,
      image: "/images/beach-cleanup.jpg",
    },
    {
      id: 2,
      title: "Food Drive for Local Shelter",
      category: "Food Donation",
      date: "Tomorrow, 1:00 PM",
      location: "Central Park",
      spots: 5,
      image: "/images/food-drive.jpg",
    },
    {
      id: 3,
      title: "Literacy Tutoring",
      category: "Education",
      date: "Every Tuesday, 4:00 PM",
      location: "City Library",
      spots: 8,
      image: "/images/literacy-tutoring.jpg",
    },
    {
      id: 4,
      title: "Animal Shelter Support",
      category: "Animal Welfare",
      date: "This Weekend, 10:00 AM",
      location: "Paws & Hearts Shelter",
      spots: 3, 
      image: "/images/animal-shelter.jpg",
    },
  ];

  const filteredEvents = selectedCategory === "All" 
    ? featuredEvents 
    : featuredEvents.filter(event => event.category === selectedCategory);

  return (
    <div className="overflow-hidden bg-white">
      {/* SECTION 1: Hero with Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 pt-20 pb-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            {/* Pattern Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 2px, transparent 0)",
                backgroundSize: "40px 40px",
                transform: `translateY(${scrollY * 0.1}px)`,
              }}
            ></div>
          </div>

          {/* Colorful gradient orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white">
              Make an <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Impact</span> in Your Community
            </h1>

            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with meaningful causes and track your volunteering journey, all in one place.
            </p>

            {/* Search and quick actions */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl mb-10 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FiSearch className="text-white/70" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for volunteer opportunities near you"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center whitespace-nowrap shadow-lg">
                  Find Opportunities
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>

            {/* Impact Stats Carousel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {impactStats.map((stat, index) => (
                  <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-white"
                >
                  <div className="text-indigo-300 mb-2 text-2xl">{stat.icon}</div>
                  <p className="text-3xl font-bold">{stat.number}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Featured Opportunities */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Featured Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-center">
              Discover ways to make a difference in your community today
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex overflow-x-auto pb-4 mb-8 justify-center flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === selectedCategory 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
            </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/600x400/indigo/white?text=${event.title.replace(' ', '+')}`;
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {event.category}
                    </span>
                    <span className="text-purple-600 text-sm font-medium">{event.spots} spots left</span>
                    </div>
                  <h3 className="font-bold text-lg mb-1 text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-1">
                    <FiCalendar className="mr-1" size={14} />
                    {event.date}
                    </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <FiMapPin className="mr-1" size={14} />
                    {event.location}
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <span className="text-indigo-600 text-sm font-medium flex items-center">
                    View Details
                    <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
                ))}
              </div>

          <div className="text-center mt-12">
            <Link 
              to="/events" 
              className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              Browse all opportunities
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How NeighborNet Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to make a difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 relative border border-gray-100">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
                <p className="text-gray-600 mb-5">
                  Sign up and build your volunteer profile with your skills, interests, and availability.
                </p>
                <ul className="space-y-2">
                  {["Personalized dashboard", "Skill matching", "Custom notifications"].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 relative border border-gray-100">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Find Opportunities</h3>
                <p className="text-gray-600 mb-5">
                  Browse and filter volunteer opportunities that match your interests and schedule.
                </p>
                <ul className="space-y-2">
                  {["Location-based search", "Interest matching", "Flexible scheduling"].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 relative border border-gray-100">
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Track Your Impact</h3>
                <p className="text-gray-600 mb-5">
                  Log your hours, receive acknowledgments, and see the difference you're making.
                </p>
                <ul className="space-y-2">
                  {["Visual impact dashboard", "Verification system", "Achievement badges"].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA with Community Stats */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Connect with other volunteers and organizations in your area and be part of something bigger.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/auth/signup"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl font-medium flex items-center justify-center transition-all hover:shadow-lg"
              >
                Get Started
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/auth/login"
                className="bg-indigo-500/20 backdrop-blur-md text-white border border-white/20 hover:bg-indigo-500/30 px-8 py-4 rounded-xl font-medium flex items-center justify-center transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

            {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
              <div className="flex items-start mb-4">
                <div className="flex -space-x-2 mr-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 font-medium">
                    MP
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600 font-medium">
                    CS
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium">
                    Maria P. & Community Shelter
                  </div>
                  <div className="text-white/60 text-sm">
                    Volunteer & Organization
                  </div>
                </div>
              </div>
              <p className="text-white/80 italic">
                "NeighborNet has transformed how we connect with our volunteers.
                The platform makes it easy to coordinate efforts and track
                impact. It's a game-changer for our community."
              </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
