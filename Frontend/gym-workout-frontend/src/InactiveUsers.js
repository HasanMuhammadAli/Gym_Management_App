import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InactiveUsers = () => {
  const [duration, setDuration] = useState('');
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInactiveUsers = async () => {
    if (!duration || isNaN(duration) || duration <= 0) {
      setError('Please enter a valid number of days');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usersResponse = await axios.get('http://localhost:3000/api/users');
      const allUsers = usersResponse.data;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(duration));

      const inactiveUsersList = [];
      
      for (const user of allUsers) {
        const historyResponse = await axios.get('http://localhost:3000/api/history', {
          params: { user_id: user.user_id }
        });

        const recentHistory = historyResponse.data.filter(
          (session) => new Date(session.date) >= cutoffDate
        );

        if (recentHistory.length === 0) {
          inactiveUsersList.push({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            phone_no: user.phone_no
          });
        }
      }

      setInactiveUsers(inactiveUsersList);
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchInactiveUsers();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Inactive Users</h2>
      
      <div className="mb-6">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
          Enter duration (days):
        </label>
        <div className="flex gap-4">
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-40"
            placeholder="Number of days"
            min="1"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {inactiveUsers.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Phone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inactiveUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-left w-1/4">{user.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-left w-1/4">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-left w-1/4">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-left w-1/4">{user.phone_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && !error && duration && (
          <div className="text-gray-600 text-center py-4">
            No inactive users found for the specified duration
          </div>
        )
      )}
    </div>
  );
};

export default InactiveUsers;