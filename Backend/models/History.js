import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    date: { type: Date, required: true },
    exercises_completed: [
      {
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number },
        duration: { type: Number },
        completed: { type: Boolean, default: false }, // Track if exercise was completed
      },
    ],
    total_duration: { type: Number, required: true }, // Total duration in seconds
    actual_time_minutes: { type: Number, required: true }, // Actual time taken in minutes
    completed_exercises_count: { type: Number, default: 0 }, // How many exercises were completed
    total_exercises_count: { type: Number, default: 0 }, // Total exercises in the workout
});

export default mongoose.model('History', HistorySchema);