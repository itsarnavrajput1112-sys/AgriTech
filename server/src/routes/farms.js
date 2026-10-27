import { Router } from 'express';
import { body, validationResult } from 'express-validator';
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
  try { res.json(await Farm.find({ owner: req.user.id }).sort({ createdAt: -1 })); }
  catch (e) { next(e); }
});
router.post('/', [
  body('name').trim().notEmpty().withMessage('Farm name is required.'),
  body('location').trim().notEmpty().withMessage('Farm location is required.'),
  body('area').optional().isFloat({ min: 0 }).withMessage('Area must be zero or greater.')
], check, async (req, res, next) => {
  try { res.status(201).json(await Farm.create({ ...req.body, owner: req.user.id })); }
  catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndUpdate({ _id: req.params.id, owner: req.user.id },
      { $set: { name: req.body.name, location: req.body.location, area: req.body.area, soilType: req.body.soilType, notes: req.body.notes } },
      { new: true, runValidators: true });
    if (!farm) return res.status(404).json({ message: 'Farm not found.' });
    res.json(farm);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!farm) return res.status(404).json({ message: 'Farm not found.' });
    res.json({ message: 'Farm deleted.' });
  } catch (e) { next(e); }
});
export default router;
