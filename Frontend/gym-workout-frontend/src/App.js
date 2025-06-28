import React, { useState } from 'react';
import WorkoutPlanner from './WorkoutPlanner';
import WorkoutSession from './WorkoutSession';
import MembershipForm from './MembershipForm';
import ExpiringMemberships from './ExpiringMemberships';
import UserList from './UserList';
import FitnessTest from './FitnessTest'; 
import FitnessTestHistory from './FitnessTestHistory';
import UsersDueForTest from './UsersDueForTest';
import InactiveUsers from './InactiveUsers';
import { Calendar, Play, Dumbbell, UserPlus, AlertTriangle, Users, Heart, Clock } from 'lucide-react'; // Add Users icon
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('membership');
  const [userId, setUserId] = useState('');
  const [renewalUser, setRenewalUser] = useState(null);

  const handleRenewMembership = (user) => {
    setRenewalUser(user);
    setActiveTab('membership');
  };

  const handleMembershipFormReset = () => {
    setRenewalUser(null);
  };

  return (
    <div className="App">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Fitness Tracker</h1>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => {
                    setActiveTab('membership');
                    setRenewalUser(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'membership'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Membership Form"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Membership</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('expiring')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'expiring'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Expiring Memberships"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Expiring</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('planner')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'planner'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Workout Planner"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Workout Planner</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('session')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'session'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Workout Session"
                >
                  <Play className="w-4 h-4" />
                  <span>Workout Session</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'users'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View User List"
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>
                <button
                  onClick={() => setActiveTab('fitnesstest')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'fitnesstest'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Fitness Test"
                >
                  <Heart className="w-4 h-4" />
                  <span>Fitness Test</span>
                </button>
                <button
                  onClick={() => setActiveTab('fitnesstesthistory')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'fitnesstesthistory'
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Fitness Test History"
                >
                  <Heart className="w-4 h-4" />
                  <span>Fitness Test History</span>
                </button>
                <button
                  onClick={() => setActiveTab('usersduefortest')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'usersduefortest'
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Users Due for Fitness Test"
                >
                  <Users className="w-4 h-4" />
                  <span>Due for Test</span>
                </button>
                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'inactive'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  aria-label="View Inactive Users"
                >
                  <Clock className="w-4 h-4" />
                  <span>Inactive Users</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen">
        {activeTab === 'membership' && (
          <MembershipForm 
            renewalUser={renewalUser} 
            onFormReset={handleMembershipFormReset}
          />
        )}
        {activeTab === 'expiring' && (
          <ExpiringMemberships onRenewMembership={handleRenewMembership} />
        )}
        {activeTab === 'planner' && <WorkoutPlanner user_id={userId} />}
        {activeTab === 'session' && <WorkoutSession />}
        {activeTab === 'users' && <UserList />}
        {activeTab === 'fitnesstest' && <FitnessTest />} 
        {activeTab === 'fitnesstesthistory' && <FitnessTestHistory />}
        {activeTab === 'usersduefortest' && <UsersDueForTest />}
        {activeTab === 'inactive' && <InactiveUsers />}
      </div>
    </div>
  );
}

export default App;