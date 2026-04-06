const router = require('express').Router();
const SeniorityLevel = require('../models/SeniorityLevel');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    res.json(await SeniorityLevel.find().sort({ rank: 1 }));
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const level = await SeniorityLevel.create(req.body);
    req.app.get('io').emit('seniority:updated', level);
    res.status(201).json(level);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const level = await SeniorityLevel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!level) return res.status(404).json({ error: 'Not found' });
    req.app.get('io').emit('seniority:updated', level);
    res.json(level);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await SeniorityLevel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
