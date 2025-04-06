import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState({
    title: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    startDate: '',
    endDate: '',
    volunteersNeeded: 1,
    category: 'Community Service',
    skillsRequired: [],
    image: '',
  });
  const [newSkill, setNewSkill] = useState('');

  const categories = [
    'Community Service',
    'Environmental',
    'Education',
    'Healthcare',
    'Animal Welfare',
    'Food Donation',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEvent({
        ...event,
        [parent]: {
          ...event[parent],
          [child]: value,
        },
      });
    } else {
      setEvent({
        ...event,
        [name]: value,
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !event.skillsRequired.includes(newSkill.trim())) {
      setEvent({
        ...event,
        skillsRequired: [...event.skillsRequired, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setEvent({
      ...event,
      skillsRequired: event.skillsRequired.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    if (end < start) {
      toast.error('End date cannot be before start date');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/events', event);
      
      if (response.data.success) {
        toast.success('Event created successfully');
        navigate(`/dashboard/events/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error creating event'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={event.title}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={event.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 h-32"
                  required
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={event.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={event.image}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={event.location.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={event.location.city}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={event.location.state}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={event.location.zipCode}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Time and Volunteer Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Schedule & Volunteers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={event.startDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={event.endDate}
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
                  value={event.volunteersNeeded}
                  onChange={handleChange}
                  min="1"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Skills Required */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Skills Required</h2>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="border rounded-l px-3 py-2 w-full"
                placeholder="Add a required skill..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.skillsRequired.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
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
              onClick={() => navigate('/dashboard/events')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 