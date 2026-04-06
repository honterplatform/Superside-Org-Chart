const router = require('express').Router();
const FreelancePool = require('../models/FreelancePool');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    res.json(await FreelancePool.find().populate('ownerId', 'name title'));
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const pool = await FreelancePool.create(req.body);
    res.status(201).json(pool);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const pool = await FreelancePool.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pool) return res.status(404).json({ error: 'Not found' });
    res.json(pool);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    await FreelancePool.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
