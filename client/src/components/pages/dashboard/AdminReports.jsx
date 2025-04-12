import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FiBarChart2, 
  FiPieChart, 
  FiUsers, 
  FiCalendar, 
  FiDownload, 
  FiClock,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('volunteer');
  const [timeFrame, setTimeFrame] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Generate mock data for reports
  const generateMockData = () => {
    let data = null;

    switch (reportType) {
      case 'volunteer':
        data = {
          totalVolunteers: 245,
          activeVolunteers: 183,
          inactiveVolunteers: 62,
          newVolunteers: timeFrame === 'week' ? 12 : timeFrame === 'month' ? 37 : 128,
          topSkills: [
            { name: 'Manual Labor', count: 98 },
            { name: 'Communication', count: 85 },
            { name: 'Organization', count: 72 },
            { name: 'Customer Service', count: 66 },
            { name: 'Leadership', count: 54 }
          ],
          volunteersByAge: [
            { range: '18-24', count: 78 },
            { range: '25-34', count: 92 },
            { range: '35-44', count: 43 },
            { range: '45-54', count: 19 },
            { range: '55+', count: 13 }
          ],
          reliability: 87
        };
        break;
      
      case 'event':
        data = {
          totalEvents: timeFrame === 'week' ? 8 : timeFrame === 'month' ? 24 : 67,
          upcomingEvents: timeFrame === 'week' ? 5 : timeFrame === 'month' ? 16 : 42,
          completedEvents: timeFrame === 'week' ? 3 : timeFrame === 'month' ? 8 : 25,
          totalHours: timeFrame === 'week' ? 265 : timeFrame === 'month' ? 976 : 2845,
          topCategories: [
            { name: 'Environmental', count: timeFrame === 'week' ? 3 : timeFrame === 'month' ? 9 : 22 },
            { name: 'Community Support', count: timeFrame === 'week' ? 2 : timeFrame === 'month' ? 7 : 19 },
            { name: 'Education', count: timeFrame === 'week' ? 1 : timeFrame === 'month' ? 5 : 14 },
            { name: 'Food Donation', count: timeFrame === 'week' ? 1 : timeFrame === 'month' ? 3 : 12 }
          ],
          averageVolunteers: 12
        };
        break;
      
      case 'organization':
        data = {
          totalOrganizations: 28,
          activeOrganizations: 22,
          pendingVerification: 6,
          topOrganizations: [
            { name: 'Green Earth Alliance', events: 12, volunteers: 87 },
            { name: 'Community Helpers', events: 9, volunteers: 64 },
            { name: 'Literacy First', events: 8, volunteers: 53 },
            { name: 'Elder Care Alliance', events: 7, volunteers: 42 },
            { name: 'Ocean Guardians', events: 6, volunteers: 38 }
          ],
          organizationsByType: [
            { type: 'Environmental', count: 8 },
            { type: 'Education', count: 7 },
            { type: 'Community Support', count: 6 },
            { type: 'Healthcare', count: 4 },
            { type: 'Animal Welfare', count: 3 }
          ]
        };
        break;
      
      default:
        data = {};
    }

    return data;
  };

  // Generate report based on selected type and timeframe
  const generateReport = async () => {
    setGeneratingReport(true);
    
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`/api/reports/${reportType}`, { params: { timeFrame } });
      // setReportData(response.data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Use mock data for this example
      setReportData(generateMockData());
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Load initial report data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data for initial load
        setReportData(generateMockData());
      } catch (error) {
        console.error('Error loading initial report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Export report data
  const exportReport = () => {
    // In a real app, this would generate a CSV or PDF file
    toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully`);
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Administrative Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate and view reports for volunteers, events, and organizations
        </p>
      </div>
      
      {/* Report Controls */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:items-end">
            {/* Report Type */}
            <div className="flex-1">
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="volunteer">Volunteer Report</option>
                <option value="event">Event Report</option>
                <option value="organization">Organization Report</option>
              </select>
            </div>
            
            {/* Time Frame */}
            {reportType !== 'organization' && (
              <div className="flex-1">
                <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Frame
                </label>
                <select
                  id="timeFrame"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
            )}
            
            {/* Generate Button */}
            <div>
              <button
                onClick={generateReport}
                disabled={generatingReport}
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
              >
                {generatingReport ? (
                  <>
                    <FiRefreshCw className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FiFilter className="mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
            
            {/* Export Button */}
            <div>
              <button
                onClick={exportReport}
                disabled={!reportData || generatingReport}
                className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <FiDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Volunteer Report */}
          {reportType === 'volunteer' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FiUsers className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.totalVolunteers)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FiUsers className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Volunteers</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.activeVolunteers)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <FiUsers className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">New Volunteers</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.newVolunteers)}</p>
                      <p className="text-xs text-gray-500">
                        Past {timeFrame === 'week' ? 'week' : timeFrame === 'month' ? 'month' : 'year'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <FiPieChart className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Reliability Score</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.reliability}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills and Demographics Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Skills */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Volunteer Skills</h3>
                  <div className="space-y-3">
                    {reportData.topSkills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          <span className="text-sm font-medium text-gray-500">{skill.count} volunteers</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${(skill.count / reportData.totalVolunteers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Volunteers by Age */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Volunteers by Age Group</h3>
                  <div className="space-y-3">
                    {reportData.volunteersByAge.map((ageGroup, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{ageGroup.range}</span>
                          <span className="text-sm font-medium text-gray-500">{ageGroup.count} volunteers</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${(ageGroup.count / reportData.totalVolunteers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Event Report */}
          {reportType === 'event' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FiCalendar className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Events</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.totalEvents)}</p>
                      <p className="text-xs text-gray-500">
                        Past {timeFrame === 'week' ? 'week' : timeFrame === 'month' ? 'month' : 'year'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FiCalendar className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.upcomingEvents)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <FiUsers className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg. Volunteers</p>
                      <p className="text-2xl font-bold text-gray-800">{reportData.averageVolunteers}</p>
                      <p className="text-xs text-gray-500">per event</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <FiClock className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Hours</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.totalHours)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event Categories Chart */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Events by Category</h3>
                <div className="space-y-3">
                  {reportData.topCategories.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        <span className="text-sm font-medium text-gray-500">{category.count} events</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(category.count / reportData.totalEvents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Event Timeline */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Status Timeline</h3>
                <div className="flex h-20 items-center">
                  <div className="flex-1 h-4 bg-green-200 rounded-l-full">
                    <div className="h-full bg-green-500 rounded-l-full" style={{ width: `${(reportData.upcomingEvents / reportData.totalEvents) * 100}%` }}></div>
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-r-full">
                    <div className="h-full bg-gray-500 rounded-r-full" style={{ width: `${(reportData.completedEvents / reportData.totalEvents) * 100}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-sm font-medium text-gray-700">Upcoming</span>
                    </div>
                    <p className="text-lg font-semibold">{reportData.upcomingEvents}</p>
                    <p className="text-xs text-gray-500">({Math.round((reportData.upcomingEvents / reportData.totalEvents) * 100)}%)</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-1"></div>
                      <span className="text-sm font-medium text-gray-700">Completed</span>
                    </div>
                    <p className="text-lg font-semibold">{reportData.completedEvents}</p>
                    <p className="text-xs text-gray-500">({Math.round((reportData.completedEvents / reportData.totalEvents) * 100)}%)</p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Organization Report */}
          {reportType === 'organization' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FiBarChart2 className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Organizations</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.totalOrganizations)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FiBarChart2 className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Organizations</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.activeOrganizations)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                      <FiBarChart2 className="text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                      <p className="text-2xl font-bold text-gray-800">{formatNumber(reportData.pendingVerification)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Organizations Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Top Organizations by Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Events
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volunteers
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participation Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.topOrganizations.map((org, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {org.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {org.events}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {org.volunteers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, (org.volunteers / org.events / 5) * 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Organizations by Type */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Organizations by Type</h3>
                <div className="space-y-3">
                  {reportData.organizationsByType.map((type, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{type.type}</span>
                        <span className="text-sm font-medium text-gray-500">{type.count} organizations</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(type.count / reportData.totalOrganizations) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports; 