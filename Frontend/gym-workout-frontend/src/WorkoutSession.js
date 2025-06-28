import React, { useState, useEffect } from 'react';
import { Clock, Target, CheckCircle, Save, Calendar, Search, Timer } from 'lucide-react';

const WorkoutSession = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [userId, setUserId] = useState('');
  const [dayName, setDayName] = useState('Monday');
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [actualTimeTaken, setActualTimeTaken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch workout for the user and day name
  const fetchWorkout = async () => {
    if (!phoneNo || !dayName) {
      setMessage('Please provide a phone number and select a day.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      // First, fetch user_id by phone_no
      const userIdResponse = await fetch(
        `http://localhost:3000/api/user/by-phone/${encodeURIComponent(phoneNo)}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!userIdResponse.ok) {
        setMessage('User not found with this phone number.');
        setTimeout(() => setMessage(''), 3000);
        setCurrentWorkout(null);
        setUserId('');
        setLoading(false);
        return;
      }

      const { user_id } = await userIdResponse.json();
      setUserId(user_id);

      // Then, fetch workout using user_id
      const response = await fetch(
        `http://localhost:3000/api/workouts?user_id=${encodeURIComponent(user_id)}&recurring_day=${encodeURIComponent(dayName)}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (response.ok) {
        const workouts = await response.json();
        const workout = Array.isArray(workouts) && workouts.length > 0 ? workouts[0] : null;
        setCurrentWorkout(workout);
        setCompletedExercises(new Set());
        setActualTimeTaken('');
        if (!workout) {
          setMessage(`No workout found for ${dayName}.`);
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        setMessage(`No workout found for ${dayName}.`);
        setTimeout(() => setMessage(''), 3000);
        setCurrentWorkout(null);
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      setMessage('Error loading workout. Please try again.');
      setTimeout(() => setMessage(''), 3000);
      setCurrentWorkout(null);
      setUserId('');
    } finally {
      setLoading(false);
    }
  };

  // Toggle exercise completion
  const toggleExerciseCompletion = (exerciseIndex) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseIndex)) {
        newSet.delete(exerciseIndex);
      } else {
        newSet.add(exerciseIndex);
      }
      return newSet;
    });
  };

  // Calculate completion percentage for display
  const getCompletionPercentage = () => {
    if (!currentWorkout?.exercises || !Array.isArray(currentWorkout.exercises)) return 0;
    return Math.round((completedExercises.size / currentWorkout.exercises.length) * 100);
  };

  // Calculate estimated duration for the session
  const calculateEstimatedDuration = () => {
    if (!currentWorkout?.exercises) return 0;
    let total = 0;
    currentWorkout.exercises.forEach(exercise => {
      total += exercise.duration ? exercise.duration * (exercise.sets || 1) : (exercise.sets || 1) * 60;
    });
    return Math.round(total / 60);
  };

  // Validate time input
  const handleTimeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setActualTimeTaken(value);
    }
  };

  const saveSession = async () => {
    if (!currentWorkout || completedExercises.size === 0) {
      setMessage('Please complete at least one exercise before saving.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!actualTimeTaken || parseFloat(actualTimeTaken) <= 0) {
      setMessage('Please enter the actual time taken for the workout.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!userId) {
      setMessage('User ID not found. Please fetch the workout again.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const sessionData = {
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        exercises_completed: currentWorkout.exercises.map((exercise, index) => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration,
          completed: completedExercises.has(index)
        })),
        total_duration: Math.round(parseFloat(actualTimeTaken) * 60),
        actual_time_minutes: parseFloat(actualTimeTaken),
        completed_exercises_count: completedExercises.size,
        total_exercises_count: currentWorkout.exercises.length
      };

      const response = await fetch('http://localhost:3000/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        setMessage('Workout session saved successfully!');
        // Reset all state variables
        setPhoneNo('');
        setUserId('');
        setDayName('Monday');
        setCurrentWorkout(null);
        setCompletedExercises(new Set());
        setActualTimeTaken('');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.text();
        setMessage(`Error saving session: ${errorData}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving session:', error);
      setMessage('Network error. Please check if the server is running.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header and Inputs */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Workout Session</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone_no"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                  aria-required="true"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <label htmlFor="day_name" className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <div className="relative">
                <select
                  id="day_name"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
                  aria-required="true"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            <div>
              <button
                onClick={fetchWorkout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 h-10"
                aria-label="Fetch workout"
              >
                {loading ? 'Fetching...' : 'Fetch Workout'}
              </button>
            </div>
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

        {currentWorkout && currentWorkout.exercises?.length > 0 ? (
          <>
            {/* Workout Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">{dayName} Workout</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Target size={16} className="mr-1" />
                      <span>{currentWorkout.exercises.length} exercises</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{calculateEstimatedDuration()} min estimated</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{getCompletionPercentage()}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{completedExercises.size} of {currentWorkout.exercises.length} exercises</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Time Taken Input */}
            {completedExercises.size > 0 && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <label htmlFor="actual_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Time Taken (minutes)
                </label>
                <div className="relative max-w-xs">
                  <input
                    id="actual_time"
                    type="text"
                    placeholder="e.g., 45 or 45.5"
                    value={actualTimeTaken}
                    onChange={handleTimeChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    aria-required="true"
                  />
                  <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the total time you spent on this workout (estimated: {calculateEstimatedDuration()} min)
                </p>
              </div>
            )}

            {/* Exercises List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Exercises</h3>
              {currentWorkout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  onClick={() => toggleExerciseCompletion(index)}
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                    completedExercises.has(index)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <button
                          className={`p-2 rounded-full transition-colors ${
                            completedExercises.has(index)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          aria-label={`Mark ${exercise.name} as ${
                            completedExercises.has(index) ? 'incomplete' : 'complete'
                          }`}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <div>
                          <h4
                            className={`font-medium ${
                              completedExercises.has(index)
                                ? 'text-green-700 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {exercise.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {exercise.sets || 'N/A'} sets
                            {exercise.reps ? ` × ${exercise.reps} reps` : ''}
                            {exercise.duration ? ` for ${exercise.duration}s` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Done Button */}
            <button
              onClick={saveSession}
              disabled={loading || completedExercises.size === 0 || !actualTimeTaken}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center mt-8 disabled:opacity-50"
              aria-label="Save workout session"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Done'}
            </button>

            {/* Completion Message */}
            {getCompletionPercentage() === 100 && actualTimeTaken && (
              <div className="mt-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-4 text-center">
                <h3 className="text-xl font-bold mb-2">🎉 Workout Complete!</h3>
                <p>Great job finishing your workout in {actualTimeTaken} minutes!</p>
                <p className="text-sm mt-1 opacity-90">
                  {parseFloat(actualTimeTaken) < calculateEstimatedDuration()
                    ? "You beat the estimated time!"
                    : parseFloat(actualTimeTaken) > calculateEstimatedDuration()
                    ? "You took your time - that's perfectly fine!"
                    : "Right on time!"}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Workout Scheduled</h3>
            <p className="text-gray-500">
              {currentWorkout === null && phoneNo && dayName
                ? `No workout found for ${dayName}.`
                : 'Enter a phone number and select a day to fetch a workout.'}
              <br />
              Create a workout plan or try a different day!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSession;