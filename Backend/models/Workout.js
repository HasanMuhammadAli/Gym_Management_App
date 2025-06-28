import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema({
  
    user_id: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    recurring_day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    exercises: [
      {
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: Number },
        duration: { type: Number },
      },
    ],
  });
  


export default mongoose.model('Workout', WorkoutSchema);