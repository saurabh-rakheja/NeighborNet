import React, { useState, useEffect } from "react";
import { FiUsers, FiSearch, FiFilter } from "react-icons/fi";

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Simulated data fetch
    const fetchVolunteers = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          const mockVolunteers = [
            {
              id: 1,
              name: "Jane Smith",
              email: "jane.smith@example.com",
              phone: "(555) 123-4567",
              skills: ["Teaching", "First Aid"],
              eventsAttended: 12,
              status: "active",
              joinedDate: "2023-01-15",
            },
            {
              id: 2,
              name: "John Doe",
              email: "john.doe@example.com",
              phone: "(555) 987-6543",
              skills: ["Driving", "Photography"],
              eventsAttended: 5,
              status: "active",
              joinedDate: "2023-03-22",
            },
            {
              id: 3,
              name: "Alex Johnson",
              email: "alex.j@example.com",
              phone: "(555) 555-5555",
              skills: ["Languages", "Administration"],
              eventsAttended: 8,
              status: "inactive",
              joinedDate: "2023-02-10",
            },
          ];
          setVolunteers(mockVolunteers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch = volunteer.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && volunteer.status === "active") ||
      (filter === "inactive" && volunteer.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUsers className="mr-2" /> Volunteer Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search volunteers..."
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="relative">
            <select
              className="w-36 px-4 py-2 border border-gray-300 rounded-lg appearance-none pl-10"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Volunteers List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Skills
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Events
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No volunteers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {volunteer.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {volunteer.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {volunteer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.eventsAttended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          volunteer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(volunteer.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteerList;
