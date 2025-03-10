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
} from "react-icons/fi";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [activeImpact, setActiveImpact] = useState(0);

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

  return (
    <div className="overflow-hidden bg-gray-50">
      {/* SECTION 1: Hero with Interactive Elements */}
      <section className="relative min-h-screen overflow-hidden bg-gray-900">
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
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container relative z-10 mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
          {/* Floating Dashboard Preview */}
          <div className="absolute top-20 right-0 md:top-32 md:right-10 w-64 h-48 md:w-96 md:h-64 bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 overflow-hidden hidden md:block">
            <img
              src="/images/dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/800x600/indigo/white?text=Dashboard+Preview";
              }}
            />
          </div>

          {/* Floating Card 2 */}
          <div className="absolute top-60 right-60 w-48 h-40 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl transform -rotate-6 hover:rotate-0 transition-all duration-500 p-4 hidden lg:flex flex-col justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <FiCheckCircle />
              </div>
              <div className="ml-2">
                <p className="text-xs text-white/80">New Event</p>
                <p className="text-sm font-medium text-white">Beach Cleanup</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-indigo-400 border border-white/30 flex items-center justify-center text-[10px] text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full bg-indigo-600 border border-white/30 flex items-center justify-center text-[10px] text-white">
                  +5
                </div>
              </div>
              <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200">
              Where Change
              <br />
              <span className="relative">
                Makers
                <svg
                  className="absolute h-3 md:h-4 bottom-2 left-0 w-full text-indigo-500"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C75.5 3 118 3 297 9"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </span>
              <span className="text-white"> Connect</span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
              NeighborNet brings together passionate individuals and meaningful
              causes, making volunteer management seamless, engaging, and
              impactful.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <Link
                to="/aurh/signup"
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl font-medium flex items-center justify-center transition-all hover:shadow-xl hover:shadow-indigo-500/25"
              >
                Make a Difference
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  <FiArrowRight />
                </span>
              </Link>
              <Link
                to="/auth/login"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-8 py-4 rounded-xl font-medium flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            {/* Animated Impact Stats */}
            <div className="relative h-24 overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-lg">
              <div
                className="absolute inset-0 flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeImpact * 100}%)` }}
              >
                {impactStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex-none w-full h-full flex items-center justify-center px-4"
                  >
                    <div className="text-indigo-300 mr-4 text-xl">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {stat.number}
                      </p>
                      <p className="text-sm text-white/70">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Indicator dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                {impactStats.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === activeImpact ? "bg-white" : "bg-white/30"
                    }`}
                    onClick={() => setActiveImpact(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* SECTION 2: Interactive Journey Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-indigo-600 mb-2">
              HOW IT WORKS
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Volunteering Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow a simple path to make a meaningful impact in your community
            </p>
          </div>

          {/* Journey Steps - Interactive Timeline */}
          <div className="relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-100 via-indigo-500 to-purple-500 transform -translate-x-1/2 rounded-full"></div>

            {/* Step 1 */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center mb-16 md:mb-32">
              <div className="relative z-10 md:text-right mb-10 md:mb-0">
                <span className="inline-block text-sm font-semibold text-indigo-600 mb-2">
                  STEP 01
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Create Your Profile
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Sign up and build your volunteer profile highlighting your
                  skills, interests, and availability.
                </p>
                <ul className="space-y-2">
                  {[
                    "Personalized dashboard",
                    "Skill matching",
                    "Custom notifications",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-end text-gray-700"
                    >
                      <span className="mr-2">{item}</span>
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="hidden md:flex absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full items-center justify-center text-lg font-bold z-10">
                  1
                </div>
                <div className="rounded-xl overflow-hidden bg-white shadow-xl transform md:translate-x-4 hover:translate-y-[-5px] transition-all duration-300">
                  <div className="bg-indigo-50 p-2">
                    <img
                      src="/images/profile-creation.png"
                      alt="Create profile"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/800x450/indigo/white?text=Create+Profile";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FiUsers />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold">Profile Builder</h4>
                        <p className="text-sm text-gray-500">
                          Easy to customize profile
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center mb-16 md:mb-32">
              <div className="order-2 md:order-1 relative mb-10 md:mb-0">
                <div className="hidden md:flex absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full items-center justify-center text-lg font-bold z-10">
                  2
                </div>
                <div className="rounded-xl overflow-hidden bg-white shadow-xl transform md:translate-x-[-4px] hover:translate-y-[-5px] transition-all duration-300">
                  <div className="bg-indigo-50 p-2">
                    <img
                      src="/images/discover-events.png"
                      alt="Discover events"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/800x450/indigo/white?text=Discover+Events";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FiMapPin />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold">Event Explorer</h4>
                        <p className="text-sm text-gray-500">
                          Find opportunities near you
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 relative z-10">
                <span className="inline-block text-sm font-semibold text-indigo-600 mb-2">
                  STEP 02
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Discover Opportunities
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Browse and filter volunteer opportunities that match your
                  interests and schedule.
                </p>
                <ul className="space-y-2">
                  {[
                    "Location-based search",
                    "Interest matching",
                    "Flexible scheduling",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
              <div className="relative z-10 md:text-right mb-10 md:mb-0">
                <span className="inline-block text-sm font-semibold text-indigo-600 mb-2">
                  STEP 03
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Track Your Impact
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  Log your hours, receive acknowledgments, and see the
                  difference you're making.
                </p>
                <ul className="space-y-2">
                  {[
                    "Visual impact dashboard",
                    "Verification system",
                    "Achievement badges",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-end text-gray-700"
                    >
                      <span className="mr-2">{item}</span>
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="hidden md:flex absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full items-center justify-center text-lg font-bold z-10">
                  3
                </div>
                <div className="rounded-xl overflow-hidden bg-white shadow-xl transform md:translate-x-4 hover:translate-y-[-5px] transition-all duration-300">
                  <div className="bg-indigo-50 p-2">
                    <img
                      src="/images/impact-tracking.png"
                      alt="Track impact"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/800x450/indigo/white?text=Track+Impact";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <FiHeart />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-semibold">Impact Monitor</h4>
                        <p className="text-sm text-gray-500">
                          See your contribution grow
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Community & CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col lg:flex-row items-center">
          {/* Community Map */}
          <div className="lg:w-1/2 mb-16 lg:mb-0">
            <div className="relative">
              <div className="relative overflow-hidden bg-black/30 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-white/10 max-w-xl mx-auto">
                <div className="rounded-lg overflow-hidden relative">
                  <img
                    src="/images/volunteer-map.png"
                    alt="Volunteer community map"
                    className="w-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/800x600/indigo/white?text=Community+Map";
                    }}
                  />

                  {/* Animated pins */}
                  {[
                    { left: "20%", top: "30%", delay: "0s" },
                    { left: "70%", top: "25%", delay: "1s" },
                    { left: "30%", top: "60%", delay: "0.5s" },
                    { left: "80%", top: "65%", delay: "1.5s" },
                    { left: "50%", top: "45%", delay: "2s" },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3"
                      style={{ left: pos.left, top: pos.top }}
                    >
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
                        style={{ animationDelay: pos.delay }}
                      ></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </div>
                  ))}
                </div>

                {/* Stats overlay */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="text-xs font-medium text-white">
                    Active Volunteers
                  </div>
                  <div className="text-2xl font-bold text-white">30,142</div>
                  <div className="flex items-center text-green-400 text-xs mt-1">
                    <FiArrowRight className="transform rotate-45 mr-1" />
                    <span>+12% this month</span>
                  </div>
                </div>

                {/* Community pulse */}
                <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
                  <div className="flex items-center">
                    <FiUsers className="text-white mr-2" />
                    <div className="text-sm font-medium text-white">
                      Community Pulse
                    </div>
                  </div>
                  <div className="mt-2 flex space-x-1">
                    {[85, 60, 90, 65, 75, 95, 70].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white/20 rounded-full"
                        style={{ height: "24px" }}
                      >
                        <div
                          className="bg-gradient-to-t from-indigo-500 to-purple-400 rounded-full w-full"
                          style={{ height: `${h}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -bottom-6 -left-6 transform rotate-12 bg-white rounded-lg p-2 shadow-lg animate-float">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                    <FiCoffee />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Downtown Cleanup</p>
                    <p className="text-gray-600">Just started</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-4 transform -rotate-6 bg-white rounded-lg p-2 shadow-lg animate-float animation-delay-1000">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-2">
                    <FiHeart />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Animal Shelter</p>
                    <p className="text-gray-600">Needs help today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Content */}
          <div className="lg:w-1/2 lg:pl-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join a growing community of change makers
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-lg">
              Connect with volunteers and organizations in your area, track your
              impact, and be part of something bigger than yourself.
            </p>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
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

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth/signup"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl font-medium flex items-center justify-center transition-all hover:scale-[1.02] shadow-lg"
              >
                Join Now
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                to="/about"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-8 py-4 rounded-xl font-medium flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
