const router = require('express').Router();
const Role = require('../models/Role');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    res.json(await Role.find().sort({ order: 1 }));
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json(role);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
