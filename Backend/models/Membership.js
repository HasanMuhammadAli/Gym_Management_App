import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  membership_id: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true, index: true },
  duration: { type: Number, required: true, enum: [1, 3, 6, 12] },
  start_date: { type: Date, required: true },
  money: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export default mongoose.model('Membership', membershipSchema);