import React, { useState } from 'react';
import { User, Phone, DollarSign, Calendar, Save, Search, AlertTriangle, Heart, Users, Mail, Target } from 'lucide-react';

const MembershipForm = () => {
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    phone_no: '',
    money: '',
    duration: '1',
    start_date: new Date().toISOString().split('T')[0],
    injury: [],
    disease: [],
    gender: 'Male',
    emergency_contact: '',
    age: '',
    email: '',
    fitness_goal: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const durationOptions = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '12 Months' }
  ];
  const genderOptions = ['Male', 'Female', 'Other'];

  // Fetch user info for old customers
  const fetchUserInfo = async () => {
    if (!formData.phone_no) {
      setMessage('Please enter a phone number.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone_no)) {
      setMessage('Phone number must be 10 digits.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // Step 1: Get user_id by phone number
      const phoneResponse = await fetch(`http://localhost:3000/api/user/by-phone/${encodeURIComponent(formData.phone_no)}`);
      if (!phoneResponse.ok) {
        setMessage('User not found.');
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        return;
      }
      const { user_id } = await phoneResponse.json();

      // Step 2: Fetch user details by user_id
      const userResponse = await fetch(`http://localhost:3000/api/user/${encodeURIComponent(user_id)}`);
      if (userResponse.ok) {
        const user = await userResponse.json();
        setFormData({
          phone_no: formData.phone_no,
          name: user.name,
          user_id: user.user_id,
          money: user.money || '',
          duration: user.duration?.toString() || '1',
          start_date: user.start_date || new Date().toISOString().split('T')[0],
          injury: user.injury || [],
          disease: user.disease || [],
          gender: user.gender,
          emergency_contact: user.emergency_contact,
          age: user.age || '',
          email: user.email,
          fitness_goal: user.fitness_goal
        });
      } else {
        setMessage('Error fetching user details.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error fetching user info.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.name || !formData.phone_no || !formData.money || !formData.duration ||
        !formData.start_date || !formData.gender || !formData.emergency_contact || !formData.age ||
        !formData.email || !formData.fitness_goal) {
      setMessage('Please fill in all required fields.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!/^\d{10}$/.test(formData.phone_no) || !/^\d{10}$/.test(formData.emergency_contact)) {
      setMessage('Phone numbers must be 10 digits.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!/.+\@.+\..+/.test(formData.email)) {
      setMessage('Invalid email format.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (formData.age < 16 || formData.age > 100) {
      setMessage('Age must be between 16 and 100.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      // Step 1: Create/Update user profile
      const userResponse = await fetch(`http://localhost:3000/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: formData.user_id,
          name: formData.name,
          phone_no: formData.phone_no,
          gender: formData.gender,
          emergency_contact: formData.emergency_contact,
          age: parseInt(formData.age),
          email: formData.email,
          fitness_goal: formData.fitness_goal,
          injury: formData.injury.filter(i => i),
          disease: formData.disease.filter(d => d)
        })
      });

      if (!userResponse.ok) {
        setMessage(`Error saving user: ${await userResponse.text()}`);
        setTimeout(() => setMessage(''), 3000);
        setLoading(false);
        return;
      }

      // Step 2: Create new membership entry
      const membershipResponse = await fetch('http://localhost:3000/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: formData.user_id,
          duration: parseInt(formData.duration),
          start_date: formData.start_date,
          money: parseFloat(formData.money)
        })
      });

      if (membershipResponse.ok) {
        setMessage(`Membership ${isNewCustomer ? 'created' : 'added'} successfully!`);
        setTimeout(() => setMessage(''), 3000);
        setFormData({
          user_id: '',
          name: '',
          phone_no: '',
          money: '',
          duration: '1',
          start_date: new Date().toISOString().split('T')[0],
          injury: [],
          disease: [],
          gender: 'Male',
          emergency_contact: '',
          age: '',
          email: '',
          fitness_goal: ''
        });
      } else {
        setMessage(`Error saving membership: ${await membershipResponse.text()}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Network error.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add injury or disease
  const addHealthEntry = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], ''] });
  };

  // Remove injury or disease
  const removeHealthEntry = (type, index) => {
    setFormData({ ...formData, [type]: formData[type].filter((_, i) => i !== index) });
  };

  // Update injury or disease
  const updateHealthEntry = (type, index, value) => {
    const updatedEntries = [...formData[type]];
    updatedEntries[index] = value;
    setFormData({ ...formData, [type]: updatedEntries });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gym Membership Form</h1>

        {/* Toggle New/Old */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setIsNewCustomer(true);
                setFormData({
                  user_id: '',
                  name: '',
                  phone_no: '',
                  money: '',
                  duration: '1',
                  start_date: new Date().toISOString().split('T')[0],
                  injury: [],
                  disease: [],
                  gender: 'Male',
                  emergency_contact: '',
                  age: '',
                  email: '',
                  fitness_goal: ''
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              New Customer
            </button>
            <button
              onClick={() => {
                setIsNewCustomer(false);
                setFormData({
                  user_id: '',
                  name: '',
                  phone_no: '',
                  money: '',
                  duration: '1',
                  start_date: new Date().toISOString().split('T')[0],
                  injury: [],
                  disease: [],
                  gender: 'Male',
                  emergency_contact: '',
                  age: '',
                  email: '',
                  fitness_goal: ''
                });
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isNewCustomer ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Old Customer
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <div className="relative">
                <input
                  id="user_id"
                  name="user_id"
                  type="text"
                  placeholder="Enter user ID"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            {!isNewCustomer && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchUserInfo}
                  disabled={loading}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Search className="inline w-4 h-4 mr-2" />
                  {loading ? 'Fetching...' : 'Get Info'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone_no"
                  name="phone_no"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone_no}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {genderOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <div className="relative">
                <input
                  id="emergency_contact"
                  name="emergency_contact"
                  type="tel"
                  placeholder="Enter 10-digit contact number"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <div className="relative">
                <input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={handleChange}
                  min="16"
                  max="100"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="fitness_goal" className="block text-sm font-medium text-gray-700 mb-2">
              Fitness Goal
            </label>
            <div className="relative">
              <input
                id="fitness_goal"
                name="fitness_goal"
                type="text"
                placeholder="Enter fitness goal (e.g., Weight loss)"
                value={formData.fitness_goal}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Injuries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Injuries (Optional)
            </label>
            {formData.injury.map((injury, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter injury (e.g., Knee pain)"
                    value={injury}
                    onChange={(e) => updateHealthEntry('injury', index, e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => removeHealthEntry('injury', index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addHealthEntry('injury')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 disabled:opacity-50"
              disabled={loading}
            >
              Add Injury
            </button>
          </div>

          {/* Diseases */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diseases (Optional)
            </label>
            {formData.disease.map((disease, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter disease (e.g., Diabetes)"
                    value={disease}
                    onChange={(e) => updateHealthEntry('disease', index, e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => removeHealthEntry('disease', index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addHealthEntry('disease')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 disabled:opacity-50"
              disabled={loading}
            >
              Add Disease
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="money" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Cost ($)
              </label>
              <div className="relative">
                <input
                  id="money"
                  name="money"
                  type="number"
                  placeholder="Enter plan cost"
                  value={formData.money}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Plan Duration
              </label>
              <div className="relative">
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Membership'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MembershipForm;