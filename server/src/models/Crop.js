import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', default: null },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  variety: { type: String, trim: true, default: '' },
  sowingDate: { type: Date, default: null },
  expectedHarvest: { type: Date, default: null },
  status: { type: String, enum: ['Planned', 'Growing', 'Ready to harvest', 'Harvested'], default: 'Growing' },
  notes: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true });

export default mongoose.model('Crop', cropSchema);
