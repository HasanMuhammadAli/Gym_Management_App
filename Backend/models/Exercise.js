import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  focus_area: { type: String, required: true },
  video_url: { type: String },
  default_sets: { type: Number, default: 3 },
  default_reps: { type: Number, default: 15 },
  rest_interval: { type: Number, default: 30 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
});

export default mongoose.model('Exercise', ExerciseSchema);