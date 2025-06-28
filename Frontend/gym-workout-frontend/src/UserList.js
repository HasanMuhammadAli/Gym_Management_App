import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper function to convert seconds to minutes and format
  const formatDuration = (seconds) => {
    if (!seconds) return '0';
    const minutes = Math.round(seconds / 60);
    return minutes.toString();
  };

  // Helper function to get actual time in minutes (prioritize actual_time_minutes if available)
  const getActualDuration = (session) => {
    if (session.actual_time_minutes) {
      return session.actual_time_minutes.toString();
    }
    return formatDuration(session.total_duration);
  };

  // Helper function to get latest 4 workout sessions
  const getLatestWorkoutHistory = (history) => {
    if (!history || history.length === 0) return [];
    
    // Sort by date (most recent first) and take only the latest 4
    return history
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  };

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data); // Display all users by default
      } catch (err) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    const term = searchTerm.toLowerCase().trim();
    if (term === '') {
      setFilteredUsers(users); // Show all users if search term is empty
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          (user.phone_no && user.phone_no.toLowerCase().includes(term))
      );
      setFilteredUsers(filtered);
    }
  };

  // Fetch workout history for selected user
  const fetchWorkoutHistory = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/history?user_id=${userId}`);
      const data = await response.json();
      setWorkoutHistory(data);
    } catch (err) {
      setError('Failed to fetch workout history');
    }
  };

  // Open modal with user details
  const openUserModal = async (user) => {
    setSelectedUser(user);
    await fetchWorkoutHistory(user.user_id);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setWorkoutHistory([]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>

      {/* Search Bar and Button */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading State */}
      {loading && <div className="text-center">Loading...</div>}

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.user_id}
              className="p-4 border rounded-md shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => openUserModal(user)}
            >
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-gray-600">Phone: {user.phone_no}</p>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Fitness Goal: {user.fitness_goal}</p>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">{selectedUser.name}'s Details</h2>
            <p><strong>User ID:</strong> {selectedUser.user_id}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone_no}</p>
            <p><strong>Gender:</strong> {selectedUser.gender}</p>
            <p><strong>Age:</strong> {selectedUser.age}</p>
            <p><strong>Emergency Contact:</strong> {selectedUser.emergency_contact}</p>
            <p><strong>Fitness Goal:</strong> {selectedUser.fitness_goal}</p>
            <p><strong>Injuries:</strong> {selectedUser.injury.length > 0 ? selectedUser.injury.join(', ') : 'None'}</p>
            <p><strong>Diseases:</strong> {selectedUser.disease.length > 0 ? selectedUser.disease.join(', ') : 'None'}</p>

            {/* Workout History - Limited to Latest 4 */}
            <h3 className="text-lg font-semibold mt-4">Workout History</h3>
            {workoutHistory.length > 0 ? (
              <ul className="list-disc pl-5">
                {getLatestWorkoutHistory(workoutHistory).map((session, index) => (
                  <li key={index}>
                    {new Date(session.date).toLocaleDateString()} - {session.exercises_completed.length} exercises,{' '}
                    {getActualDuration(session)} minutes
                    {session.completed_exercises_count && session.total_exercises_count && (
                      <span className="text-gray-600 text-sm">
                        {' '}({session.completed_exercises_count}/{session.total_exercises_count} completed)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No workout history available</p>
            )}

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;