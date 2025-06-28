import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, User, Phone, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const ExpiringMemberships = ({ onRenewMembership }) => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [expiringUsers, setExpiringUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  const fetchExpiringUsers = async () => {
    if (!month || !year) {
      setMessage('Please select both month and year.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/expiring?month=${month}&year=${year}`);
      
      if (response.ok) {
        const users = await response.json();
        setExpiringUsers(users);
        
        if (users.length === 0) {
          setMessage(`No memberships expiring in ${months.find(m => m.value === month)?.label} ${year}.`);
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || 'Error fetching expiring memberships.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRenew = (user) => {
    if (onRenewMembership) {
      onRenewMembership(user);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
          Expiring Memberships
        </h1>

        {/* Search Form */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select Month</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchExpiringUsers}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('error')
                ? 'bg-red-100 text-red-700'
                : message.includes('No memberships')
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        {/* Results */}
        {expiringUsers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {expiringUsers.length} membership{expiringUsers.length !== 1 ? 's' : ''} expiring in{' '}
              {months.find(m => m.value === month)?.label} {year}
            </h2>
            
            <div className="space-y-4">
              {expiringUsers.map((user) => {
                const daysRemaining = getDaysRemaining(user.end_date);
                const isExpired = daysRemaining < 0;
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining >= 0;
                
                return (
                  <div
                    key={user.user_id}
                    className={`border rounded-lg p-4 ${
                      isExpired
                        ? 'border-red-300 bg-red-50'
                        : isExpiringSoon
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium">{user.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">User ID</p>
                              <p className="font-medium">{user.user_id}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium">{user.phone_no}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">End Date</p>
                              <p className="font-medium">{formatDate(user.end_date)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500">Plan Cost</p>
                              <p className="font-medium">${user.money}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium">{user.duration} month{user.duration !== 1 ? 's' : ''}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p
                              className={`font-medium ${
                                isExpired
                                  ? 'text-red-600'
                                  : isExpiringSoon
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {isExpired
                                ? `Expired ${Math.abs(daysRemaining)} days ago`
                                : daysRemaining === 0
                                ? 'Expires today'
                                : `${daysRemaining} days remaining`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <button
                          onClick={() => handleRenew(user)}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            isExpired
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : isExpiringSoon
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isExpired ? 'Renew Expired' : 'Renew'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiringMemberships;