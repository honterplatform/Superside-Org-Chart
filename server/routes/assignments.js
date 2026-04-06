const router = require('express').Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const { logActivity } = require('../services/activityLogger');

router.post('/', auth, async (req, res, next) => {
  try {
    const assignment = await Assignment.create(req.body);
    const populated = await Assignment.findById(assignment._id)
      .populate('personId')
      .populate('accountId');
    await logActivity('created_assignment', 'assignment', assignment._id, { after: populated.toObject() });
    req.app.get('io').emit('assignment:created', populated);
    res.status(201).json(populated);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const before = await Assignment.findById(req.params.id).lean();
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('personId')
      .populate('accountId');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    await logActivity('updated_assignment', 'assignment', assignment._id, { before, after: assignment.toObject() });
    req.app.get('io').emit('assignment:updated', assignment);
    res.json(assignment);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    await Assignment.findByIdAndDelete(req.params.id);
    await logActivity('deleted_assignment', 'assignment', assignment._id, { before: assignment });
    req.app.get('io').emit('assignment:deleted', { _id: req.params.id, personId: assignment.personId });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.put('/reorder', auth, async (req, res, next) => {
  try {
    const { assignments } = req.body; // [{id, order}]
    for (const { id, order } of assignments) {
      await Assignment.findByIdAndUpdate(id, { order });
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
