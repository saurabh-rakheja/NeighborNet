import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    skills: '',
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.skills) queryParams.append('skills', filters.skills);
      
      const response = await axios.get(`/api/volunteers?${queryParams.toString()}`);
      
      if (response.data.success) {
        setVolunteers(response.data.data);
      } else {
        toast.error('Error fetching volunteers');
      }
    } catch (error) {
      toast.error('Error fetching volunteers');
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVolunteers();
  };

  const handleVerify = async (volunteerId) => {
    try {
      setActionLoading(true);
      
      const response = await axios.patch(`/api/volunteers/${volunteerId}/verify`, {
        status: 'Verified'
      });
      
      if (response.data.success) {
        toast.success('Volunteer verified successfully');
        
        // Update the volunteer in the state
        setVolunteers(volunteers.map(volunteer => 
          volunteer._id === volunteerId 
            ? { ...volunteer, verificationStatus: 'Verified' } 
            : volunteer
        ));
      } else {
        toast.error('Error verifying volunteer');
      }
    } catch (error) {
      toast.error('Error verifying volunteer');
      console.error('Error verifying volunteer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (volunteerId) => {
    try {
      setActionLoading(true);
      
      const response = await axios.patch(`/api/volunteers/${volunteerId}/verify`, {
        status: 'Rejected'
      });
      
      if (response.data.success) {
        toast.success('Volunteer application rejected');
        
        // Update the volunteer in the state
        setVolunteers(volunteers.map(volunteer => 
          volunteer._id === volunteerId 
            ? { ...volunteer, verificationStatus: 'Rejected' } 
            : volunteer
        ));
      } else {
        toast.error('Error rejecting volunteer application');
      }
    } catch (error) {
      toast.error('Error rejecting volunteer application');
      console.error('Error rejecting volunteer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const statusBadge = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading volunteers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Volunteer Management</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Verification Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={filters.skills}
                onChange={handleFilterChange}
                placeholder="e.g. teaching, cooking"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Search</label>
              <div className="flex">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name or email"
                  className="w-full border rounded-l px-3 py-2"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Volunteers List */}
      {volunteers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No volunteers found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden">
                          {volunteer.profileImage ? (
                            <img src={volunteer.profileImage} alt={volunteer.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                              {volunteer.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {volunteer.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {volunteer.age ? `${volunteer.age} years old` : 'Age not provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{volunteer.email}</div>
                      <div className="text-sm text-gray-500">{volunteer.phone || 'No phone provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills && volunteer.skills.length > 0 ? (
                          volunteer.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No skills listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(volunteer.verificationStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(volunteer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        {volunteer.verificationStatus === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(volunteer._id)}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-800 text-left"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleReject(volunteer._id)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-800 text-left"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {volunteer.verificationStatus === 'Verified' && (
                          <button
                            onClick={() => handleReject(volunteer._id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-800 text-left"
                          >
                            Revoke
                          </button>
                        )}
                        {volunteer.verificationStatus === 'Rejected' && (
                          <button
                            onClick={() => handleVerify(volunteer._id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 text-left"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerList; 