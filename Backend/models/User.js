import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone_no: { type: String, required: true, match: /^\d{10}$/ },
  injury: [{ type: String }],
  disease: [{ type: String }],
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  emergency_contact: { type: String, required: true, match: /^\d{10}$/ },
  age: { type: Number, required: true, min: 16, max: 100 },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  fitness_goal: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);