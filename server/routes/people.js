const router = require('express').Router();
const Person = require('../models/Person');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const { logActivity } = require('../services/activityLogger');

// GET /api/people - List all with filters
router.get('/', auth, async (req, res, next) => {
  try {
    const { region, capability, status, search, seniority, managerId } = req.query;
    const filter = {};

    if (region) filter.region = region;
    if (capability) filter.capabilities = capability;
    if (status) filter.status = status;
    if (seniority) filter.seniority = seniority;
    if (managerId) filter.managerId = managerId === 'null' ? null : managerId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const people = await Person.find(filter)
      .populate('managerId', 'name title')
      .populate('secondaryManagerId', 'name title')
      .sort({ order: 1, name: 1 });

    res.json(people);
  } catch (err) { next(err); }
});

// GET /api/people/:id - Single person with assignments
router.get('/:id', auth, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('managerId', 'name title')
      .populate('secondaryManagerId', 'name title');
    if (!person) return res.status(404).json({ error: 'Person not found' });

    const assignments = await Assignment.find({ personId: person._id })
      .populate('accountId')
      .sort({ order: 1 });

    const directReports = await Person.find({ managerId: person._id })
      .sort({ order: 1, name: 1 });

    res.json({ ...person.toObject(), assignments, directReports });
  } catch (err) { next(err); }
});

// GET /api/people/:id/tree - Person + all reports recursively
router.get('/:id/tree', auth, async (req, res, next) => {
  try {
    const allPeople = await Person.find().lean();
    const assignments = await Assignment.find().populate('accountId').lean();

    const assignmentMap = {};
    for (const a of assignments) {
      if (!assignmentMap[a.personId]) assignmentMap[a.personId] = [];
      assignmentMap[a.personId].push(a);
    }

    function buildTree(personId) {
      const person = allPeople.find(p => p._id.toString() === personId.toString());
      if (!person) return null;
      const children = allPeople.filter(p => p.managerId && p.managerId.toString() === personId.toString());
      return {
        ...person,
        assignments: assignmentMap[person._id] || [],
        children: children.map(c => buildTree(c._id)).filter(Boolean)
      };
    }

    const tree = buildTree(req.params.id);
    if (!tree) return res.status(404).json({ error: 'Person not found' });
    res.json(tree);
  } catch (err) { next(err); }
});

// POST /api/people - Create
router.post('/', auth, async (req, res, next) => {
  try {
    const person = await Person.create(req.body);
    await logActivity('added_person', 'person', person._id, { after: person.toObject() });
    req.app.get('io').emit('person:created', person);
    res.status(201).json(person);
  } catch (err) { next(err); }
});

// PUT /api/people/:id - Update
router.put('/:id', auth, async (req, res, next) => {
  try {
    const before = await Person.findById(req.params.id).lean();
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('managerId', 'name title')
      .populate('secondaryManagerId', 'name title');
    if (!person) return res.status(404).json({ error: 'Person not found' });
    await logActivity('updated_person', 'person', person._id, { before, after: person.toObject() });
    req.app.get('io').emit('person:updated', person);
    res.json(person);
  } catch (err) { next(err); }
});

// PUT /api/people/:id/move - Change manager
router.put('/:id/move', auth, async (req, res, next) => {
  try {
    const { managerId } = req.body;
    const before = await Person.findById(req.params.id).lean();
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      { managerId: managerId || null },
      { new: true }
    ).populate('managerId', 'name title');
    if (!person) return res.status(404).json({ error: 'Person not found' });
    await logActivity('moved_person', 'person', person._id, { before, after: person.toObject() });
    req.app.get('io').emit('person:moved', person);
    res.json(person);
  } catch (err) { next(err); }
});

// PUT /api/people/:id/position - Save free-form canvas position
router.put('/:id/position', auth, async (req, res, next) => {
  try {
    const { posX, posY } = req.body;
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      { posX, posY },
      { new: true }
    );
    if (!person) return res.status(404).json({ error: 'Person not found' });
    req.app.get('io').emit('person:moved', person);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PUT /api/people/positions/reset - Clear all custom positions (back to auto-layout)
router.put('/positions/reset', auth, async (req, res, next) => {
  try {
    await Person.updateMany({}, { posX: null, posY: null });
    req.app.get('io').emit('positions:reset');
    res.json({ success: true });
  } catch (err) { next(err); }
});

// PUT /api/people/reorder - Batch update order for siblings
router.put('/reorder/batch', auth, async (req, res, next) => {
  try {
    const { updates } = req.body; // [{ id, order, managerId? }]
    for (const u of updates) {
      const set = { order: u.order };
      if (u.managerId !== undefined) set.managerId = u.managerId || null;
      await Person.findByIdAndUpdate(u.id, set);
    }
    const allPeople = await Person.find()
      .populate('managerId', 'name title')
      .populate('secondaryManagerId', 'name title')
      .sort({ order: 1, name: 1 });
    req.app.get('io').emit('people:reordered', allPeople);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/people/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id).lean();
    if (!person) return res.status(404).json({ error: 'Person not found' });
    await Assignment.deleteMany({ personId: req.params.id });
    await Person.updateMany({ managerId: req.params.id }, { managerId: person.managerId });
    await Person.findByIdAndDelete(req.params.id);
    await logActivity('removed_person', 'person', person._id, { before: person });
    req.app.get('io').emit('person:deleted', { _id: req.params.id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/people/:id/assignments
router.get('/:id/assignments', auth, async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ personId: req.params.id })
      .populate('accountId')
      .sort({ order: 1 });
    res.json(assignments);
  } catch (err) { next(err); }
});

module.exports = router;
