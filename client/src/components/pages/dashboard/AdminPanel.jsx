import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    pendingVolunteers: 0,
    totalVolunteers: 0,
    upcomingEvents: 0,
    totalShifts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Fetch pending volunteers
      const volunteersResponse = await axios.get('/api/volunteers?status=Pending');
      
      // Fetch all volunteers
      const allVolunteersResponse = await axios.get('/api/volunteers');
      
      // Fetch upcoming events
      const eventsResponse = await axios.get('/api/events?status=Upcoming');
      
      // Fetch total shifts
      const shiftsResponse = await axios.get('/api/shifts');
      
      setStats({
        pendingVolunteers: volunteersResponse.data.data.length,
        totalVolunteers: allVolunteersResponse.data.data.length,
        upcomingEvents: eventsResponse.data.data.length,
        totalShifts: shiftsResponse.data.data.length,
      });
    } catch (error) {
      toast.error('Error fetching admin statistics');
      console.error('Error fetching admin statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading admin dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Volunteers</p>
              <h3 className="text-3xl font-bold">{stats.totalVolunteers}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Pending Verifications</p>
              <h3 className="text-3xl font-bold">{stats.pendingVolunteers}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Upcoming Events</p>
              <h3 className="text-3xl font-bold">{stats.upcomingEvents}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Shifts</p>
              <h3 className="text-3xl font-bold">{stats.totalShifts}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="text-3xl text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Volunteer Management</h3>
            <p className="text-gray-600 mb-4">View and manage volunteer profiles and verification statuses.</p>
            <Link
              to="/dashboard/admin/volunteers"
              className="block w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded"
            >
              Manage Volunteers
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="text-3xl text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Event Management</h3>
            <p className="text-gray-600 mb-4">Create and manage volunteer events and their details.</p>
            <Link
              to="/dashboard/events"
              className="block w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white text-center rounded"
            >
              Manage Events
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="text-3xl text-purple-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Generate Reports</h3>
            <p className="text-gray-600 mb-4">View volunteer hours, impact metrics, and event statistics.</p>
            <Link
              to="/dashboard/admin/reports"
              className="block w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white text-center rounded"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 