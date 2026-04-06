const router = require('express').Router();
const Capability = require('../models/Capability');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    res.json(await Capability.find().sort({ order: 1 }));
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const cap = await Capability.create(req.body);
    req.app.get('io').emit('capability:updated', cap);
    res.status(201).json(cap);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const cap = await Capability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cap) return res.status(404).json({ error: 'Not found' });
    req.app.get('io').emit('capability:updated', cap);
    res.json(cap);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Capability.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
