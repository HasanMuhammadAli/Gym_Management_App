import React, { useState } from 'react';

const initialExercises = {
  strength: { pushup_reps: '', squats_reps: '', pull_ups_reps: '' },
  flexibility: { sit_and_touch_cm: '', shoulder_stretch_cm: '', hamstring_stretch_cm: '' },
  cardio_endurance: { ten_min_run_bpm: '', ten_min_cycle_bpm: '' }
};

const initialPhysicalData = {
  weight_kg: '',
  height: { feet: '', inches: '' },
  bpm_before_test: '',
  bpm_after_test: ''
};

const FitnessTest = () => {
  const [phoneNo, setPhoneNo] = useState('');
  const [userId, setUserId] = useState('');
  const [goal, setGoal] = useState('');
  const [exercises, setExercises] = useState(initialExercises);
  const [physicalData, setPhysicalData] = useState(initialPhysicalData);

  const handleExerciseChange = (e, category) => {
    const { name, value } = e.target;
    setExercises(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: value
      }
    }));
  };

  const handlePhysicalDataChange = (e) => {
    const { name, value } = e.target;
    if (name === 'feet' || name === 'inches') {
      setPhysicalData(prev => ({
        ...prev,
        height: { ...prev.height, [name]: value }
      }));
    } else {
      setPhysicalData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneNoChange = (e) => {
    setPhoneNo(e.target.value);
    setUserId('');
    setExercises(initialExercises);
    setPhysicalData(initialPhysicalData);
    setGoal('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNo) {
      alert('Please enter a phone number');
      return;
    }
    if (!goal) {
      alert('Please enter a fitness goal');
      return;
    }
    for (const section of Object.values(exercises)) {
      for (const val of Object.values(section)) {
        if (val === '' || val === null) {
          alert('Please fill all exercise fields');
          return;
        }
      }
    }
    for (const [key, val] of Object.entries(physicalData)) {
      if (key === 'height') {
        if (val.feet === '' || val.inches === '') {
          alert('Please fill all height fields');
          return;
        }
      } else if (val === '' || val === null) {
        alert('Please fill all physical data fields');
        return;
      }
    }

    try {
      // Fetch user_id by phone_no
      const userIdResponse = await fetch(
        `http://localhost:3000/api/user/by-phone/${encodeURIComponent(phoneNo)}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!userIdResponse.ok) {
        alert('User not found with this phone number');
        return;
      }

      const { user_id } = await userIdResponse.json();
      setUserId(user_id);

      const testData = {
        user_id: user_id,
        date: new Date().toISOString(),
        goal,
        exercises: {
          strength: {
            pushup_reps: Number(exercises.strength.pushup_reps),
            squats_reps: Number(exercises.strength.squats_reps),
            pull_ups_reps: Number(exercises.strength.pull_ups_reps)
          },
          flexibility: {
            sit_and_touch_cm: Number(exercises.flexibility.sit_and_touch_cm),
            shoulder_stretch_cm: Number(exercises.flexibility.shoulder_stretch_cm),
            hamstring_stretch_cm: Number(exercises.flexibility.hamstring_stretch_cm)
          },
          cardio_endurance: {
            ten_min_run_bpm: Number(exercises.cardio_endurance.ten_min_run_bpm),
            ten_min_cycle_bpm: Number(exercises.cardio_endurance.ten_min_cycle_bpm)
          }
        },
        physical_data: {
          weight_kg: Number(physicalData.weight_kg),
          height: {
            feet: Number(physicalData.height.feet),
            inches: Number(physicalData.height.inches)
          },
          bpm_before_test: Number(physicalData.bpm_before_test),
          bpm_after_test: Number(physicalData.bpm_after_test)
        }
      };

      const response = await fetch('http://localhost:3000/api/fitness-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        alert('Fitness test data saved successfully!');
        setExercises(initialExercises);
        setPhysicalData(initialPhysicalData);
        setGoal('');
        setPhoneNo('');
        setUserId('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.msg}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving fitness test data');
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 mx-auto mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Fitness Test</h1>

      {/* Phone Number Input */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Enter Phone Number</h2>
        <input
          type="tel"
          value={phoneNo}
          onChange={handlePhoneNoChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Phone Number"
        />
      </div>

      {/* Fitness Goal Input */}
      {phoneNo && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Fitness Goal</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            required
          />
        </div>
      )}

      {/* Form for Tests */}
      {phoneNo && (
        <div onSubmit={handleSubmit} className="space-y-6">
          {/* Strength Test */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Strength Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Push-up Reps</label>
                <input
                  type="number"
                  name="pushup_reps"
                  value={exercises.strength.pushup_reps}
                  onChange={e => handleExerciseChange(e, 'strength')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Squats Reps</label>
                <input
                  type="number"
                  name="squats_reps"
                  value={exercises.strength.squats_reps}
                  onChange={e => handleExerciseChange(e, 'strength')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Pull-ups Reps</label>
                <input
                  type="number"
                  name="pull_ups_reps"
                  value={exercises.strength.pull_ups_reps}
                  onChange={e => handleExerciseChange(e, 'strength')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Flexibility Test */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Flexibility Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Sit and Touch (cm)</label>
                <input
                  type="number"
                  name="sit_and_touch_cm"
                  value={exercises.flexibility.sit_and_touch_cm}
                  onChange={e => handleExerciseChange(e, 'flexibility')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Shoulder Stretch (cm)</label>
                <input
                  type="number"
                  name="shoulder_stretch_cm"
                  value={exercises.flexibility.shoulder_stretch_cm}
                  onChange={e => handleExerciseChange(e, 'flexibility')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Hamstring Stretch (cm)</label>
                <input
                  type="number"
                  name="hamstring_stretch_cm"
                  value={exercises.flexibility.hamstring_stretch_cm}
                  onChange={e => handleExerciseChange(e, 'flexibility')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cardio Endurance Test */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Cardio Endurance Test</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">01-min Run (bpm)</label>
                <input
                  type="number"
                  name="ten_min_run_bpm"
                  value={exercises.cardio_endurance.ten_min_run_bpm}
                  onChange={e => handleExerciseChange(e, 'cardio_endurance')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">10-min Cycle (bpm)</label>
                <input
                  type="number"
                  name="ten_min_cycle_bpm"
                  value={exercises.cardio_endurance.ten_min_cycle_bpm}
                  onChange={e => handleExerciseChange(e, 'cardio_endurance')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Physical Data */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Physical Data</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={physicalData.weight_kg}
                  onChange={handlePhysicalDataChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-600 mb-1">Height (feet)</label>
                  <input
                    type="number"
                    name="feet"
                    value={physicalData.height.feet}
                    onChange={handlePhysicalDataChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 mb-1">Height (inches)</label>
                  <input
                    type="number"
                    name="inches"
                    value={physicalData.height.inches}
                    onChange={handlePhysicalDataChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    max="11.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">BPM At Rest</label>
                <input
                  type="number"
                  name="bpm_before_test"
                  value={physicalData.bpm_before_test}
                  onChange={handlePhysicalDataChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">MHR (max bpm)</label>
                <input
                  type="number"
                  name="bpm_after_test"
                  value={physicalData.bpm_after_test}
                  onChange={handlePhysicalDataChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Fitness Test Data
          </button>
        </div>
      )}
    </div>
  );
};

export default FitnessTest;