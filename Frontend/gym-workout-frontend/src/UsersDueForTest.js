import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'tailwindcss/tailwind.css';

const UsersDueForTest = () => {
  const [usersDue, setUsersDue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsersDueForTest = async () => {
      try {
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:3000/api/users');
        const users = usersResponse.data;

        // Calculate users due for a test (more than 3 months since last test)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const dueUsers = [];
        
        // Fetch latest fitness test for each user
        for (const user of users) {
          try {
            const testsResponse = await axios.get(`http://localhost:3000/api/fitness-tests/user/${user.user_id}`);
            const fitnessTests = testsResponse.data;
            
            // Find the latest test
            const latestTest = fitnessTests.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            // Check if the latest test is older than 3 months or if no tests exist
            if (!latestTest || new Date(latestTest.date) < threeMonthsAgo) {
              dueUsers.push({
                phone_no: user.phone_no || 'N/A',
                name: user.name || 'Unknown',
                lastTestDate: latestTest ? new Date(latestTest.date).toLocaleDateString() : 'No test recorded',
                goal: latestTest ? latestTest.goal : user.fitness_goal || 'N/A'
              });
            }
          } catch (err) {
            // If no tests found for user, they are due for a test
            if (err.response?.status === 404) {
              dueUsers.push({
                phone_no: user.phone_no || 'N/A',
                name: user.name || 'Unknown',
                lastTestDate: 'No test recorded',
                goal: user.fitness_goal || 'N/A'
              });
            }
          }
        }

        setUsersDue(dueUsers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user or fitness test data');
        setLoading(false);
      }
    };

    fetchUsersDueForTest();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Users Due for Fitness Test</h2>
      {usersDue.length === 0 ? (
        <p className="text-gray-600">No users are currently due for a fitness test.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Phone Number</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Last Test Date</th>
                <th className="py-2 px-4 border-b">Fitness Goal</th>
              </tr>
            </thead>
            <tbody>
              {usersDue.map(user => (
                <tr key={user.phone_no} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.phone_no}</td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.lastTestDate}</td>
                  <td className="py-2 px-4 border-b">{user.goal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersDueForTest;