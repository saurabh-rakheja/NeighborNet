import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiHelpCircle,
  FiBookOpen,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiFile,
  FiPlus,
  FiMinus,
  FiUser,
  FiCalendar,
  FiAward,
  FiInfo,
} from "react-icons/fi";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { id: "general", name: "General", icon: <FiInfo /> },
    { id: "account", name: "Your Account", icon: <FiUser /> },
    { id: "events", name: "Events & Applications", icon: <FiCalendar /> },
    { id: "impact", name: "Impact & Rewards", icon: <FiAward /> },
  ];

  const faqs = {
    general: [
      {
        id: "g1",
        question: "What is the Volunteer Management System?",
        answer:
          "The Volunteer Management System is a platform that connects volunteers with NGOs and organizations in need of assistance. It helps volunteers find meaningful opportunities and allows organizations to manage their volunteer programs effectively.",
      },
      {
        id: "g2",
        question: "How does the volunteer matching process work?",
        answer:
          "Our system uses your skills, interests, and availability to match you with volunteer opportunities that align with your profile. Organizations post opportunities, and you can browse them, apply directly, or receive recommendations based on your preferences.",
      },
      {
        id: "g3",
        question: "Is there a mobile app available?",
        answer:
          "Currently, we offer a responsive web application that works on all devices. A dedicated mobile app is under development and will be released soon. Stay tuned for updates!",
      },
    ],
    account: [
      {
        id: "a1",
        question: "How do I update my profile information?",
        answer:
          "You can update your profile by clicking on 'My Profile' in the dashboard sidebar. From there, click the 'Edit Profile' button to modify your personal information, skills, interests, and availability.",
      },
      {
        id: "a2",
        question: "How can I change my password?",
        answer:
          "To change your password, go to 'Settings' in the dashboard sidebar. Under the 'Change Password' section, enter your current password and your new password twice to confirm the change.",
      },
      {
        id: "a3",
        question: "Can I delete my account?",
        answer:
          "Yes, you can delete your account by going to Settings and scrolling to the bottom where you'll find the 'Delete Account' option. Please note that this action is irreversible and will remove all your data from our system.",
      },
    ],
    events: [
      {
        id: "e1",
        question: "How do I apply for a volunteer opportunity?",
        answer:
          "To apply for a volunteer opportunity, browse the available events in the 'Find Opportunities' section. When you find an event you're interested in, click the 'View Details' button, then click 'Apply Now' to submit your application.",
      },
      {
        id: "e2",
        question: "How can I track my volunteer applications?",
        answer:
          "You can view all your submitted applications in the 'My Applications' section of the dashboard. This shows the status of each application (Pending, Approved, Rejected) and any messages from the organization.",
      },
      {
        id: "e3",
        question: "Can I cancel my participation in an event?",
        answer:
          "Yes, if you can no longer attend an event you've been approved for, please navigate to 'My Applications', find the event, and click the 'Cancel Participation' button. Please do this as early as possible to allow organizations to find a replacement.",
      },
    ],
    impact: [
      {
        id: "i1",
        question: "How is my volunteer impact calculated?",
        answer:
          "Your impact is calculated based on the number of hours you've volunteered, the number of events you've participated in, and the skills you've utilized. This information is displayed in the 'My Impact' section of your dashboard.",
      },
      {
        id: "i2",
        question: "What are impact levels and how do I progress?",
        answer:
          "Impact levels represent your volunteer journey. You progress through levels (Beginner, Intermediate, Advanced, Expert) by accumulating volunteer hours and completing diverse types of volunteer work. Each level unlocks new features and recognition.",
      },
      {
        id: "i3",
        question: "Can I download a certificate of my volunteer work?",
        answer:
          "Yes, you can generate certificates for completed volunteer events. Go to 'My Impact', scroll to the 'Certificates' section, and click 'Generate Certificate' for any completed event. These can be downloaded as PDFs for your records or to share with employers.",
      },
    ],
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs)
        .flat()
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : faqs[activeCategory];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 md:p-8 text-white mb-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-lg opacity-90 mb-6">
          Find answers to common questions about volunteering and using our
          platform
        </p>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-xl pl-4 pr-2 py-2 focus-within:ring-2 focus-within:ring-white">
            <FiSearch className="text-white/80 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-white placeholder-white/70 pl-2"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Category sidebar */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Categories
            </h2>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-800 mb-2 flex items-center">
                <FiMessageCircle className="mr-2" /> Need more help?
              </h3>
              <p className="text-sm text-indigo-700 mb-4">
                Can't find what you're looking for? Contact our support team for
                assistance.
              </p>
              <Link
                to="/contact"
                className="block text-center w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ content */}
        <div className="md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-xl shadow-md p-6">
            {searchQuery ? (
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Search Results for "{searchQuery}"
              </h2>
            ) : (
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {categories.find((c) => c.id === activeCategory)?.name} FAQs
              </h2>
            )}

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <FiHelpCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500">
                  We couldn't find any FAQs matching your search. Try a
                  different query or browse the categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-800">
                        {faq.question}
                      </h3>
                      <span className="text-indigo-600 ml-4">
                        {openFaq === faq.id ? <FiMinus /> : <FiPlus />}
                      </span>
                    </button>

                    {openFaq === faq.id && (
                      <div className="p-4 pt-0 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Documentation links */}
            {!searchQuery && (
              <div className="mt-10">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FiBookOpen className="mr-2 text-indigo-500" /> Helpful
                  Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/guides/getting-started"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <FiFile className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Getting Started Guide
                      </h4>
                      <p className="text-sm text-gray-600">
                        Learn the basics of our platform
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/guides/volunteer-tips"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <FiFile className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Volunteer Tips
                      </h4>
                      <p className="text-sm text-gray-600">
                        Best practices for volunteers
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
