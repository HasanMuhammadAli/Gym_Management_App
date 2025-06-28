import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Search, Filter, Save, X, Play, Clock, Target } from 'lucide-react';

const WorkoutPlanner = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusAreaFilter, setFocusAreaFilter] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState({
    phone_no: '',
    user_id: '',
    start_date: '',
    end_date: '',
    recurring_day: '',
    exercises: []
  });
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [membershipExpiry, setMembershipExpiry] = useState('');

  // Fetch exercises from API
  const fetchExercises = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/exercises');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched exercises:', data);
        setExercises(data);
      } else {
        console.error('Failed to fetch exercises');
        setMessage('Error loading exercises. Please refresh the page.');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setMessage('Error loading exercises. Please refresh the page.');
    }
  };

  // Fetch user info and membership when phone_no changes
  const fetchUserInfo = async (phoneNo) => {
    if (!phoneNo) {
      setUserName('');
      setMembershipExpiry('');
      setWorkoutPlan({ ...workoutPlan, user_id: '' });
      return;
    }

    try {
      // Fetch user_id by phone_no
      const userIdResponse = await fetch(`http://localhost:3000/api/user/by-phone/${phoneNo}`);
      if (!userIdResponse.ok) {
        setUserName('User not found');
        setMembershipExpiry('');
        setWorkoutPlan({ ...workoutPlan, user_id: '' });
        return;
      }
      const { user_id } = await userIdResponse.json();
      setWorkoutPlan({ ...workoutPlan, user_id });

      // Fetch user data
      const userResponse = await fetch(`http://localhost:3000/api/user/${user_id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserName(userData.name || 'Unknown User');
      } else {
        setUserName('User not found');
        setMembershipExpiry('');
      }

      // Fetch active membership data
      const membershipResponse = await fetch(`http://localhost:3000/api/membership/${user_id}`);
      if (membershipResponse.ok) {
        const membershipData = await membershipResponse.json();
        setMembershipExpiry(new Date(membershipData.end_date).toLocaleDateString());
      } else {
        setMembershipExpiry('No active membership');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setMessage('Error fetching user information.');
      setUserName('');
      setMembershipExpiry('');
      setWorkoutPlan({ ...workoutPlan, user_id: '' });
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    fetchUserInfo(workoutPlan.phone_no);
  }, [workoutPlan.phone_no]);

  const focusAreas = [...new Set(exercises.map(ex => ex.focus_area))];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFocus = !focusAreaFilter || exercise.focus_area === focusAreaFilter;
    return matchesSearch && matchesFocus;
  });

  const addExerciseToWorkout = (exercise) => {
    const workoutExercise = {
      name: exercise.name,
      sets: exercise.default_sets,
      reps: exercise.default_reps,
      duration: exercise.default_reps ? null : 30
    };
    
    setSelectedExercises([...selectedExercises, workoutExercise]);
    setWorkoutPlan({
      ...workoutPlan,
      exercises: [...selectedExercises, workoutExercise]
    });
  };

  const removeExerciseFromWorkout = (index) => {
    const newSelectedExercises = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(newSelectedExercises);
    setWorkoutPlan({
      ...workoutPlan,
      exercises: newSelectedExercises
    });
  };

  const updateExerciseInWorkout = (index, field, value) => {
    const updatedExercises = selectedExercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, [field]: parseInt(value) || null };
      }
      return exercise;
    });
    
    setSelectedExercises(updatedExercises);
    setWorkoutPlan({
      ...workoutPlan,
      exercises: updatedExercises
    });
  };

  const saveWorkoutPlan = async () => {
    if (!workoutPlan.user_id || !workoutPlan.start_date || !workoutPlan.end_date || !workoutPlan.recurring_day || selectedExercises.length === 0) {
      setMessage('Please fill in all required fields and add at least one exercise.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const workoutData = {
        user_id: workoutPlan.user_id,
        start_date: workoutPlan.start_date,
        end_date: workoutPlan.end_date,
        recurring_day: workoutPlan.recurring_day,
        exercises: selectedExercises
      };

      console.log('Sending workout data:', workoutData);

      const response = await fetch('http://localhost:3000/api/workout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(workoutData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const savedWorkout = await response.json();
        console.log('Saved workout:', savedWorkout);
        setMessage('Workout plan saved successfully!');
        
        setWorkoutPlan({
          phone_no: '',
          user_id: '',
          start_date: '',
          end_date: '',
          recurring_day: '',
          exercises: []
        });
        setSelectedExercises([]);
        setUserName('');
        setMembershipExpiry('');
      } else {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        setMessage(`Error saving workout plan: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage(`Network error: ${error.message}. Please check if the server is running.`);
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Workout Planner</h1>
          <p className="text-gray-600">Create your personalized workout schedule</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') || message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Plan Setup */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="mr-3 text-blue-600" />
              Plan Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={workoutPlan.phone_no}
                  onChange={(e) => setWorkoutPlan({...workoutPlan, phone_no: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {userName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {userName}
                  </div>
                </div>
              )}
              {membershipExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Membership Expiry</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {membershipExpiry}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={workoutPlan.start_date}
                    onChange={(e) => setWorkoutPlan({...workoutPlan, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={workoutPlan.end_date}
                    onChange={(e) => setWorkoutPlan({...workoutPlan, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Day</label>
                <select
                  value={workoutPlan.recurring_day}
                  onChange={(e) => setWorkoutPlan({...workoutPlan, recurring_day: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Exercises */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Exercises ({selectedExercises.length})</h3>
                <button
                  onClick={() => setShowExerciseModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </button>
              </div>

              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No exercises selected yet</p>
                  <p className="text-sm">Click "Add Exercise" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <button
                          onClick={() => removeExerciseFromWorkout(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Sets</label>
                          <input
                            type="number"
                            value={exercise.sets || ''}
                            onChange={(e) => updateExerciseInWorkout(index, 'sets', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="1"
                          />
                        </div>
                        {exercise.reps !== null ? (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
                            <input
                              type="number"
                              value={exercise.reps || ''}
                              onChange={(e) => updateExerciseInWorkout(index, 'reps', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Duration (sec)</label>
                            <input
                              type="number"
                              value={exercise.duration || ''}
                              onChange={(e) => updateExerciseInWorkout(index, 'duration', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={saveWorkoutPlan}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mt-8 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Workout Plan'}
            </button>
          </div>

          {/* Exercise Library Modal */}
          {showExerciseModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">Exercise Library</h2>
                  <button
                    onClick={() => setShowExerciseModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search exercises..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={focusAreaFilter}
                      onChange={(e) => setFocusAreaFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Focus Areas</option>
                      {focusAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3 overflow-y-auto">
                  {filteredExercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No exercises found</p>
                    </div>
                  ) : (
                    filteredExercises.map(exercise => (
                      <div key={exercise._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{exercise.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {exercise.focus_area}
                              </span>
                              <span className="flex items-center">
                                <Play className="w-3 h-3 mr-1" />
                                {exercise.default_sets} sets
                              </span>
                              {exercise.default_reps && (
                                <span>{exercise.default_reps} reps</span>
                              )}
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {exercise.rest_interval}s rest
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                              {exercise.difficulty}
                            </span>
                            <button
                              onClick={() => addExerciseToWorkout(exercise)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;