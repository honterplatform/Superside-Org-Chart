const router = require('express').Router();
const Region = require('../models/Region');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    res.json(await Region.find().sort({ order: 1 }));
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const region = await Region.create(req.body);
    req.app.get('io').emit('region:updated', region);
    res.status(201).json(region);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const region = await Region.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!region) return res.status(404).json({ error: 'Not found' });
    req.app.get('io').emit('region:updated', region);
    res.json(region);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Region.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
