import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiSearch, 
  FiFilter, 
  FiCheckCircle, 
  FiXCircle,
  FiClock,
  FiDownload
} from 'react-icons/fi';

const VolunteerList = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });
  
  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from your API
        // const response = await axios.get('/api/volunteers');
        // setVolunteers(response.data.volunteers);
        
        // Simulate API response with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock volunteer data
        const mockVolunteers = [
          {
            _id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            skills: ['Manual Labor', 'Driving'],
            joinedDate: '2023-01-15',
            totalHours: 48,
            status: 'active',
            upcomingShifts: 2,
            completedShifts: 8,
            reliability: 95
          },
          {
            _id: '2',
            name: 'Maria Rodriguez',
            email: 'maria.r@example.com',
            phone: '(555) 987-6543',
            skills: ['Education/Teaching', 'Leadership', 'Language Skills'],
            joinedDate: '2023-03-05',
            totalHours: 22,
            status: 'active',
            upcomingShifts: 1,
            completedShifts: 5,
            reliability: 100
          },
          {
            _id: '3',
            name: 'David Chen',
            email: 'david.c@example.com',
            phone: '(555) 456-7890',
            skills: ['Technical', 'Social Media'],
            joinedDate: '2023-04-20',
            totalHours: 16,
            status: 'inactive',
            upcomingShifts: 0,
            completedShifts: 4,
            reliability: 75
          },
          {
            _id: '4',
            name: 'Sarah Johnson',
            email: 'sarah.j@example.com',
            phone: '(555) 234-5678',
            skills: ['Administrative', 'Customer Service'],
            joinedDate: '2023-02-10',
            totalHours: 36,
            status: 'active',
            upcomingShifts: 3,
            completedShifts: 6,
            reliability: 100
          },
          {
            _id: '5',
            name: 'Michael Brown',
            email: 'michael.b@example.com',
            phone: '(555) 876-5432',
            skills: ['Cooking', 'Manual Labor'],
            joinedDate: '2023-05-12',
            totalHours: 12,
            status: 'active',
            upcomingShifts: 1,
            completedShifts: 3,
            reliability: 67
          }
        ];
        
        setVolunteers(mockVolunteers);
        setFilteredVolunteers(mockVolunteers);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        toast.error('Failed to load volunteer list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVolunteers();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...volunteers];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(volunteer => 
        volunteer.name.toLowerCase().includes(lowerSearchTerm) ||
        volunteer.email.toLowerCase().includes(lowerSearchTerm) ||
        volunteer.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(volunteer => volunteer.status === filterStatus);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredVolunteers(result);
  }, [volunteers, searchTerm, filterStatus, sortConfig]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };
  
  // Export volunteer data
  const exportVolunteerData = () => {
    // In a real app, you might want to create a CSV file
    // For this example, we'll just show a success message
    toast.success('Volunteer data exported successfully');
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate reliability class
  const getReliabilityClass = (reliability) => {
    if (reliability >= 90) return 'text-green-600';
    if (reliability >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Send reminder to volunteer
  const sendReminder = (volunteerId, volunteerName) => {
    // In a real app, make an API call to send the reminder
    toast.info(`Reminder sent to ${volunteerName}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Volunteer Management</h1>
        <p className="text-gray-600 mt-1">
          View and manage volunteers for your organization
        </p>
      </div>
      
      {/* Filters and Actions Bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search volunteers by name, email or skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="sm:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Volunteers</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportVolunteerData}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiDownload className="mr-2" />
              Export List
            </button>
          </div>
        </div>
      </div>
      
      {/* Volunteer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-indigo-800 text-lg font-semibold mb-2">Total Volunteers</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-indigo-700">{volunteers.length}</span>
            <span className="ml-2 text-sm text-indigo-600 mb-1">registered</span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-green-800 text-lg font-semibold mb-2">Active Volunteers</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-green-700">
              {volunteers.filter(v => v.status === 'active').length}
            </span>
            <span className="ml-2 text-sm text-green-600 mb-1">currently active</span>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-blue-800 text-lg font-semibold mb-2">Total Hours</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-blue-700">
              {volunteers.reduce((total, v) => total + v.totalHours, 0)}
            </span>
            <span className="ml-2 text-sm text-blue-600 mb-1">volunteer hours</span>
          </div>
        </div>
      </div>
      
      {/* Volunteer List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredVolunteers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 flex justify-center mb-4">
              <FiUser className="text-4xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No volunteers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Volunteer{getSortIndicator('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('joinedDate')}
                  >
                    <div className="flex items-center">
                      Joined{getSortIndicator('joinedDate')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Skills
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('totalHours')}
                  >
                    <div className="flex items-center">
                      Hours{getSortIndicator('totalHours')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('reliability')}
                  >
                    <div className="flex items-center">
                      Reliability{getSortIndicator('reliability')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiMail className="mr-1" size={12} /> {volunteer.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiPhone className="mr-1" size={12} /> {volunteer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" size={12} />
                        {formatDate(volunteer.joinedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiClock className="mr-1" size={14} />
                        {volunteer.totalHours} hours
                      </div>
                      <div className="text-xs text-gray-500">
                        {volunteer.completedShifts} shifts completed
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getReliabilityClass(volunteer.reliability)}`}>
                        {volunteer.reliability}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {volunteer.status === 'active' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          <FiXCircle className="mr-1" />
                          Inactive
                        </span>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {volunteer.upcomingShifts > 0 ? (
                          `${volunteer.upcomingShifts} upcoming shifts`
                        ) : (
                          'No upcoming shifts'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => sendReminder(volunteer._id, volunteer.name)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Remind
                      </button>
                      <a
                        href={`/dashboard/volunteers/${volunteer._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerList; 