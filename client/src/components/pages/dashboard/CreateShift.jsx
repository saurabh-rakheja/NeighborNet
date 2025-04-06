import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateShift = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [shift, setShift] = useState({
    eventId: eventId,
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    volunteersNeeded: 1,
    location: '',
    tasks: [],
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true);
        const response = await axios.get(`/api/events/${eventId}`);
        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          toast.error('Error fetching event details');
          navigate('/dashboard/events');
        }
      } catch (error) {
        toast.error('Error fetching event details');
        navigate('/dashboard/events');
      } finally {
        setEventLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShift({
      ...shift,
      [name]: value,
    });
  };

  const addTask = () => {
    if (newTask.trim() && !shift.tasks.includes(newTask.trim())) {
      setShift({
        ...shift,
        tasks: [...shift.tasks, newTask.trim()],
      });
      setNewTask('');
    }
  };

  const removeTask = (task) => {
    setShift({
      ...shift,
      tasks: shift.tasks.filter((t) => t !== task),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate times
    const start = new Date(shift.startTime);
    const end = new Date(shift.endTime);
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }
    
    if (start < eventStart || end > eventEnd) {
      toast.error('Shift must be within event time range');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/shifts', shift);
      
      if (response.data.success) {
        toast.success('Shift created successfully');
        navigate(`/dashboard/events/${eventId}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error creating shift'
      );
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return <div className="text-center py-10">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Event not found</p>
          <button
            onClick={() => navigate('/dashboard/events')}
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add Shift to {event.title}</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Shift Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Shift Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={shift.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Morning Shift, Afternoon Shift, etc."
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={shift.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 h-24"
                  placeholder="Describe what volunteers will be doing during this shift"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={shift.startTime}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Event period: {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={shift.endTime}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Volunteers Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="volunteersNeeded"
                  value={shift.volunteersNeeded}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={shift.location}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Specific location within the event venue"
                />
              </div>
            </div>
          </div>
          
          {/* Tasks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="border rounded-l px-3 py-2 w-full"
                placeholder="Add a task for this shift..."
              />
              <button
                type="button"
                onClick={addTask}
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {shift.tasks.map((task, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{task}</span>
                  <button
                    type="button"
                    onClick={() => removeTask(task)}
                    className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/events/${eventId}`)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Shift'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateShift; 