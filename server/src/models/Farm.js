import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, required: true, trim: true, maxlength: 160 },
  area: { type: Number, min: 0, default: 0 },
  soilType: { type: String, trim: true, default: 'Not specified' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });

export default mongoose.model('Farm', farmSchema);
