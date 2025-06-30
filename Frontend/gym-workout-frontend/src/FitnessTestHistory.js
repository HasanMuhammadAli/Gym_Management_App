import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Legend, Title, Tooltip } from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Legend, Title, Tooltip);

const FitnessTestHistory = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [userId, setUserId] = useState('');
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [fitnessTests, setFitnessTests] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

  const API_BASE_URL = 'http://localhost:3000/api';

  // Available metrics for charts
  const metrics = [
    { value: 'exercises.strength.pushup_reps', label: 'Push-up Reps' },
    { value: 'exercises.strength.squats_reps', label: 'Squat Reps' },
    { value: 'exercises.strength.pull_ups_reps', label: 'Pull-up Reps' },
    { value: 'exercises.flexibility.sit_and_touch_cm', label: 'Sit and Touch (cm)' },
    { value: 'exercises.flexibility.shoulder_stretch_cm', label: 'Shoulder Stretch (cm)' },
    { value: 'exercises.flexibility.hamstring_stretch_cm', label: 'Hamstring Stretch (cm)' },
    { value: 'exercises.cardio_endurance.ten_min_run_bpm', label: '01-min Run BPM' },
    { value: 'exercises.cardio_endurance.ten_min_cycle_bpm', label: '10-min Cycle BPM' },
    { value: 'physical_data.weight_kg', label: 'Weight (kg)' },
    { value: 'physical_data.height.feet', label: 'Height (Feet)' },
    { value: 'physical_data.height.inches', label: 'Height (Inches)' },
    { value: 'physical_data.bpm_before_test', label: 'BPM At Rest' },
    { value: 'physical_data.bpm_after_test', label: 'MHR' },
  ];

  // Fetch fitness tests for entered phone_no
  useEffect(() => {
    const fetchFitnessTests = async () => {
      if (!phoneNo || !fetchTrigger) return;
      try {
        // First, fetch user_id by phone_no
        const userIdResponse = await axios.get(`${API_BASE_URL}/user/by-phone/${encodeURIComponent(phoneNo)}`);
        const { user_id } = userIdResponse.data;
        setUserId(user_id);

        // Then, fetch fitness tests using user_id
        const response = await axios.get(`${API_BASE_URL}/fitness-tests/user/${user_id}`);
        setFitnessTests(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching fitness tests:', err);
        setError(err.response?.data?.message || 'Failed to fetch fitness tests. Please check the phone number.');
        setFitnessTests([]);
        setUserId('');
      }
    };
    fetchFitnessTests();
  }, [phoneNo, fetchTrigger]);

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort tests for table (default: newest first)
  const sortedTests = [...fitnessTests].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortField === 'date') {
      return sortOrder === 'asc'
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    return sortOrder === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Chart tests in ascending date order (oldest first)
  const chartTests = [...fitnessTests].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get nested metric value
  const getMetricValue = (test, metricPath) => {
    return metricPath.split('.').reduce((obj, key) => obj?.[key] ?? 0, test);
  };

  // Generate chart data for a metric
  const getChartData = (metric) => ({
    labels: chartTests.map((test) => new Date(test.date).toLocaleDateString()),
    datasets: [
      {
        label: metric.label,
        data: chartTests.map((test) => getMetricValue(test, metric.value)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  // Chart options for consistency
  const chartOptions = (metricLabel) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#374151' },
      },
      title: {
        display: true,
        text: `${metricLabel} Progress`,
        color: '#374151',
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Date', color: '#374151' },
        ticks: { color: '#374151' },
      },
      y: {
        title: { display: true, text: metricLabel, color: '#374151' },
        ticks: { color: '#374151' },
        beginAtZero: true,
      },
    },
  });

  // Handle fetch button click
  const handleFetchTests = () => {
    if (phoneNo.trim()) {
      setFetchTrigger(!fetchTrigger);
    } else {
      setError('Please enter a valid phone number');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fitness Test History</h1>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Phone Number Input */}
      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="phoneNoInput" className="block text-sm font-medium text-gray-700">
            Enter Phone Number
          </label>
          <input
            type="tel"
            id="phoneNoInput"
            value={phoneNo}
            onChange={(e) => setPhoneNo(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter phone number"
            aria-label="Enter phone number to view fitness test history"
          />
        </div>
        <div>
          <button
            onClick={handleFetchTests}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Fetch Tests
          </button>
        </div>
      </div>

      {/* Test History Table */}
      {fitnessTests.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th
                    className="px-4 py-2 border-b cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-4 py-2 border-b cursor-pointer"
                    onClick={() => handleSort('goal')}
                  >
                    Goal {sortField === 'goal' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2 border-b">Details</th>
                </tr>
              </thead>
              <tbody>
                {sortedTests.map((test) => (
                  <Fragment key={test._id}>
                    <tr
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => setExpandedTest(expandedTest === test._id ? null : test._id)}
                    >
                      <td className="px-4 py-2 border-b">{new Date(test.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 border-b">{test.goal}</td>
                      <td className="px-4 py-2 border-b">
                        <button className="text-blue-500 hover:underline">
                          {expandedTest === test._id ? 'Hide Details' : 'Show Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedTest === test._id && (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Strength */}
                            <div>
                              <h3 className="font-semibold">Strength</h3>
                              <p>Push-ups: {test.exercises.strength.pushup_reps} reps</p>
                              <p>Squats: {test.exercises.strength.squats_reps} reps</p>
                              <p>Pull-ups: {test.exercises.strength.pull_ups_reps} reps</p>
                            </div>
                            {/* Flexibility */}
                            <div>
                              <h3 className="font-semibold">Flexibility</h3>
                              <p>Sit and Touch: {test.exercises.flexibility.sit_and_touch_cm} cm</p>
                              <p>Shoulder Stretch: {test.exercises.flexibility.shoulder_stretch_cm} cm</p>
                              <p>Hamstring Stretch: {test.exercises.flexibility.hamstring_stretch_cm} cm</p>
                            </div>
                            {/* Cardio Endurance */}
                            <div>
                              <h3 className="font-semibold">Cardio Endurance</h3>
                              <p>01-min Run: {test.exercises.cardio_endurance.ten_min_run_bpm} bpm</p>
                              <p>10-min Cycle: {test.exercises.cardio_endurance.ten_min_cycle_bpm} bpm</p>
                            </div>
                            {/* Physical Data */}
                            <div>
                              <h3 className="font-semibold">Physical Data</h3>
                              <p>Weight: {test.physical_data.weight_kg} kg</p>
                              <p>Height: {test.physical_data.height.feet} ft {test.physical_data.height.inches} in</p>
                              {typeof test.physical_data.bmi !== 'undefined' && (
                                <p>BMI: {test.physical_data.bmi}</p>
                              )}
                              <p>BPM At Rest: {test.physical_data.bpm_before_test} bpm</p>
                              <p>MHR: {test.physical_data.bpm_after_test} bpm</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts for All Metrics */}
          {fitnessTests.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Progress Over Time</h2>
              {metrics.map((metric) => (
                <div key={metric.value} className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">{metric.label} Progress</h3>
                  <Line
                    data={getChartData(metric)}
                    options={chartOptions(metric.label)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500">No fitness tests found for the entered phone number.</p>
      )}
    </div>
  );
};

export default FitnessTestHistory;