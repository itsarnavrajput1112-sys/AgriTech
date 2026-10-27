import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Crop from '../models/Crop.js';
import Farm from '../models/Farm.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
const check = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ message: result.array()[0].msg });
  next();
};
router.get('/', async (req, res, next) => {
  try { res.json(await Crop.find({ owner: req.user.id }).populate('farm', 'name location').sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});
router.post('/', [
  body('name').trim().notEmpty().withMessage('Crop name is required.'),
  body('status').optional().isIn(['Planned', 'Growing', 'Ready to harvest', 'Harvested']).withMessage('Invalid crop status.')
], check, async (req, res, next) => {
  try {
    if (req.body.farm) {
      const farm = await Farm.findOne({ _id: req.body.farm, owner: req.user.id });
      if (!farm) return res.status(400).json({ message: 'Select one of your own farms.' });
    }
    const crop = await Crop.create({ ...req.body, owner: req.user.id });
    res.status(201).json(await crop.populate('farm', 'name location'));
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    if (req.body.farm) {
      const farm = await Farm.findOne({ _id: req.body.farm, owner: req.user.id });
      if (!farm) return res.status(400).json({ message: 'Select one of your own farms.' });
    }
    const crop = await Crop.findOneAndUpdate({ _id: req.params.id, owner: req.user.id },
      { $set: { farm: req.body.farm || null, name: req.body.name, variety: req.body.variety, sowingDate: req.body.sowingDate || null, expectedHarvest: req.body.expectedHarvest || null, status: req.body.status, notes: req.body.notes } },
      { new: true, runValidators: true }).populate('farm', 'name location');
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json(crop);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!crop) return res.status(404).json({ message: 'Crop not found.' });
    res.json({ message: 'Crop deleted.' });
  } catch (e) { next(e); }
});
export default router;
