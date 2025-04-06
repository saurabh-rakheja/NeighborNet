import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminReports = () => {
  const [reports, setReports] = useState({
    totalVolunteerHours: 0,
    averageHoursPerVolunteer: 0,
    mostPopularEvents: [],
    topVolunteers: [],
    monthlyStats: [],
    categoryCounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API endpoint that returns precomputed statistics
      // For now, we'll simulate these reports with mock data
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample data - in a real application, this would come from your API
      const mockReports = {
        totalVolunteerHours: 1248,
        averageHoursPerVolunteer: 8.5,
        mostPopularEvents: [
          { _id: '1', title: 'Beach Cleanup', volunteerCount: 45, category: 'Environmental' },
          { _id: '2', title: 'Food Drive', volunteerCount: 37, category: 'Food Donation' },
          { _id: '3', title: 'Shelter Assistance', volunteerCount: 31, category: 'Community Service' },
          { _id: '4', title: 'Animal Shelter Support', volunteerCount: 28, category: 'Animal Welfare' },
          { _id: '5', title: 'Reading Program', volunteerCount: 24, category: 'Education' },
        ],
        topVolunteers: [
          { _id: '1', name: 'John Smith', hours: 42, eventsAttended: 8 },
          { _id: '2', name: 'Sarah Johnson', hours: 36, eventsAttended: 6 },
          { _id: '3', name: 'Michael Brown', hours: 32, eventsAttended: 5 },
          { _id: '4', name: 'Emily Davis', hours: 28, eventsAttended: 7 },
          { _id: '5', name: 'Robert Wilson', hours: 24, eventsAttended: 4 },
        ],
        monthlyStats: [
          { month: 'Jan', hours: 98, volunteers: 24 },
          { month: 'Feb', hours: 112, volunteers: 28 },
          { month: 'Mar', hours: 125, volunteers: 32 },
          { month: 'Apr', hours: 143, volunteers: 36 },
          { month: 'May', hours: 165, volunteers: 42 },
          { month: 'Jun', hours: 178, volunteers: 45 },
        ],
        categoryCounts: [
          { category: 'Environmental', count: 12 },
          { category: 'Community Service', count: 18 },
          { category: 'Education', count: 9 },
          { category: 'Healthcare', count: 7 },
          { category: 'Animal Welfare', count: 8 },
          { category: 'Food Donation', count: 11 },
          { category: 'Other', count: 5 },
        ],
      };
      
      setReports(mockReports);
    } catch (error) {
      toast.error('Error fetching report data');
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Impact Reports</h1>
        
        <div>
          <select
            value={timeframe}
            onChange={handleTimeframeChange}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Volunteer Impact Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Total Volunteer Hours</span>
              <span className="text-2xl font-bold">{reports.totalVolunteerHours}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Average Hours per Volunteer</span>
              <span className="text-2xl font-bold">{reports.averageHoursPerVolunteer}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Total Events</span>
              <span className="text-2xl font-bold">{reports.categoryCounts.reduce((sum, item) => sum + item.count, 0)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Categories</h2>
          
          <div className="space-y-3">
            {reports.categoryCounts.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                  <div 
                    className={`h-4 rounded-full ${
                      item.category === 'Environmental' ? 'bg-green-500' :
                      item.category === 'Community Service' ? 'bg-blue-500' :
                      item.category === 'Education' ? 'bg-yellow-500' :
                      item.category === 'Healthcare' ? 'bg-red-500' :
                      item.category === 'Animal Welfare' ? 'bg-purple-500' :
                      item.category === 'Food Donation' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${(item.count / Math.max(...reports.categoryCounts.map(c => c.count))) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between w-48">
                  <span className="text-sm">{item.category}</span>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Popular Events and Top Volunteers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Most Popular Events</h2>
          </div>
          
          <div className="p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.mostPopularEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{event.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{event.volunteerCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Top Volunteers</h2>
          </div>
          
          <div className="p-2">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.topVolunteers.map((volunteer) => (
                  <tr key={volunteer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{volunteer.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{volunteer.hours}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{volunteer.eventsAttended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Volunteer Trends</h2>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {reports.monthlyStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(stat.hours / Math.max(...reports.monthlyStats.map(s => s.hours))) * 180}px` 
                  }}
                >
                </div>
                <div 
                  className="w-full bg-green-500 rounded-t"
                  style={{ 
                    height: `${(stat.volunteers / Math.max(...reports.monthlyStats.map(s => s.volunteers))) * 120}px` 
                  }}
                >
                </div>
              </div>
              <div className="mt-2 text-xs font-medium">{stat.month}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Hours</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Volunteers</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => window.print()}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default AdminReports; 