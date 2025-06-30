import express from 'express';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import History from '../models/History.js';
import User from '../models/User.js';
import Membership from '../models/Membership.js';
import FitnessTest from '../models/FitnessTest.js';

const router = express.Router();

// GET /exercises: Fetch exercises by focus area
router.get('/exercises', async (req, res) => {
  const { focus_area } = req.query;
  try {
    const query = focus_area ? { focus_area } : {};
    const exercises = await Exercise.find(query);
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /workout: Save a new workout plan with user_id
router.post('/workout', async (req, res) => {
  const { user_id, start_date, end_date, recurring_day, exercises } = req.body;
  try {
    const workout = new Workout({
      user_id,
      start_date,
      end_date,
      recurring_day,
      exercises,
    });
    await workout.save();
    res.json(workout);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /workouts/by-date: Get workouts for a specific day for a user
router.get('/workouts/by-date', async (req, res) => {
  const { date, user_id } = req.query;
  try {
    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleString('en-US', { weekday: 'long' });
    const workouts = await Workout.find({
      user_id,
      recurring_day: dayName,
      start_date: { $lte: targetDate },
      end_date: { $gte: targetDate }
    });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /workouts: Retrieve all workouts for a user with optional filters
router.get('/workouts', async (req, res) => {
  const { start_date, end_date, recurring_day, user_id } = req.query;
  try {
    const query = {};
    if (recurring_day) query.recurring_day = recurring_day;
    if (start_date && end_date) {
      query.start_date = { $lte: new Date(end_date) };
      query.end_date = { $gte: new Date(start_date) };
    }
    if (user_id) query.user_id = user_id;
    const workouts = await Workout.find(query).sort({ start_date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /history: Retrieve workout history for a specific user
router.get('/history', async (req, res) => {
  const { user_id } = req.query;
  try {
    const query = user_id ? { user_id } : {};
    const history = await History.find(query).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /session: Log a completed workout session for a user
router.post('/session', async (req, res) => {
  const { 
    user_id, 
    date, 
    exercises_completed, 
    total_duration, 
    actual_time_minutes,
    completed_exercises_count,
    total_exercises_count 
  } = req.body;
  
  try {
    // Validate required fields
    if (!user_id || !date || !exercises_completed || !actual_time_minutes) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (actual_time_minutes <= 0) {
      return res.status(400).json({ msg: 'Actual time must be greater than 0' });
    }

    const history = new History({
      user_id,
      date,
      exercises_completed,
      total_duration,
      actual_time_minutes,
      completed_exercises_count: completed_exercises_count || exercises_completed.filter(ex => ex.completed).length,
      total_exercises_count: total_exercises_count || exercises_completed.length
    });
    
    await history.save();
    res.json(history);
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /user/:user_id: Fetch user info
router.get('/user/:user_id', async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /user: Create or update user
router.post('/user', async (req, res) => {
  try {
    const userData = {
      user_id: req.body.user_id,
      name: req.body.name,
      phone_no: req.body.phone_no,
      money: req.body.money,
      duration: req.body.duration,
      start_date: req.body.start_date,
      injury: req.body.injury || [],
      disease: req.body.disease || [],
      gender: req.body.gender,
      emergency_contact: req.body.emergency_contact,
      age: req.body.age,
      email: req.body.email,
      fitness_goal: req.body.fitness_goal
    };
    const user = await User.findOneAndUpdate(
      { user_id: req.body.user_id },
      userData,
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

router.get('/users/expiring', async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ msg: 'Month and year are required' });
  }

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12 || isNaN(yearNum)) {
    return res.status(400).json({ msg: 'Invalid month or year' });
  }

  try {
    const expiringMemberships = await Membership.aggregate([
      {
        $project: {
          user_id: 1,
          start_date: 1,
          duration: 1,
          money: 1, // Include money from Membership
          end_date: {
            $dateAdd: { startDate: '$start_date', unit: 'month', amount: '$duration' },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $month: '$end_date' }, monthNum] },
              { $eq: [{ $year: '$end_date' }, yearNum] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          user_id: 1,
          name: '$user.name',
          email: '$user.email',
          phone_no: '$user.phone_no', // Include phone_no from User
          start_date: 1,
          end_date: 1,
          duration: 1,
          money: 1,
        },
      },
    ]);

    res.json(expiringMemberships);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /membership: Create a new membership
router.post('/membership', async (req, res) => {
  try {
    // Verify user exists
    const user = await User.findOne({ user_id: req.body.user_id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const membershipData = {
      user_id: req.body.user_id,
      duration: req.body.duration,
      start_date: req.body.start_date,
      money: req.body.money
    };
    const membership = new Membership(membershipData);
    await membership.save();
    res.status(201).json(membership);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// GET /membership/:user_id: Fetch active membership for a user
router.get('/membership/:user_id', async (req, res) => {
  try {
    const membership = await Membership.findOne({
      user_id: req.params.user_id,
      $expr: {
        $gte: [
          { $dateAdd: { startDate: '$start_date', unit: 'month', amount: '$duration' } },
          new Date()
        ]
      }
    });

    if (!membership) {
      return res.status(404).json({ msg: 'No active membership found' });
    }

    const endDate = new Date(membership.start_date);
    endDate.setMonth(endDate.getMonth() + membership.duration);
    
    res.json({
      user_id: membership.user_id,
      start_date: membership.start_date,
      duration: membership.duration,
      money: membership.money,
      end_date: endDate
    });
  } catch (err) {
    console.error('Error fetching membership:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /users: Fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


// POST /api/fitness-test
// Creates a new fitness test record
router.post('/fitness-test', async (req, res) => {
  try {
    // Calculate BMI
    const { weight_kg, height } = req.body.physical_data;
    const totalInches = (Number(height.feet) * 12) + Number(height.inches);
    const heightMeters = totalInches * 0.0254;
    let bmi = null;
    if (weight_kg && heightMeters) {
      bmi = weight_kg / (heightMeters * heightMeters);
      bmi = Math.round(bmi * 100) / 100; // round to 2 decimals
    }
    req.body.physical_data.bmi = bmi;
    const fitnessTest = new FitnessTest(req.body);
    const savedTest = await fitnessTest.save();
    res.status(201).json(savedTest);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// GET /api/fitness-tests/:id
// Retrieves a fitness test record by its ID
router.get('/fitness-tests/:id', async (req, res) => {
  try {
    const fitnessTest = await FitnessTest.findById(req.params.id);
    if (!fitnessTest) {
      return res.status(404).json({ message: 'Fitness test not found' });
    }
    res.status(200).json(fitnessTest);
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID', error: error.message });
  }
});

// GET /api/fitness-tests/user/:user_id
// Retrieves all fitness test records for a user
router.get('/fitness-tests/user/:user_id', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const query = { user_id: req.params.user_id };
    
    if (start_date || end_date) {
      query.date = {};
      if (start_date) query.date.$gte = new Date(start_date);
      if (end_date) query.date.$lte = new Date(end_date);
    }
    
    const fitnessTests = await FitnessTest.find(query).sort({ date: -1 });
    if (!fitnessTests.length) {
      return res.status(404).json({ message: 'No fitness tests found for user' });
    }
    res.status(200).json(fitnessTests);
  } catch (error) {
    res.status(400).json({ message: 'Invalid query', error: error.message });
  }
});

router.get('/user/by-phone/:phone_no', async (req, res) => {
  try {
    const user = await User.findOne({ phone_no: req.params.phone_no });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user_id: user.user_id });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
export default router;