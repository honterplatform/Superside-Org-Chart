const router = require('express').Router();
const Account = require('../models/Account');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const { logActivity } = require('../services/activityLogger');

router.get('/', auth, async (req, res, next) => {
  try {
    const { region, businessUnit } = req.query;
    const filter = {};
    if (region) filter.region = region;
    if (businessUnit) filter.businessUnit = businessUnit;

    const accounts = await Account.find(filter).sort({ mrr: -1 });
    res.json(accounts);
  } catch (err) { next(err); }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const assignments = await Assignment.find({ accountId: account._id })
      .populate('personId')
      .sort({ priority: 1, order: 1 });

    res.json({ ...account.toObject(), assignments });
  } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
  try {
    const account = await Account.create(req.body);
    await logActivity('created_account', 'account', account._id, { after: account.toObject() });
    req.app.get('io').emit('account:created', account);
    res.status(201).json(account);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const before = await Account.findById(req.params.id).lean();
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    await logActivity('updated_account', 'account', account._id, { before, after: account.toObject() });
    req.app.get('io').emit('account:updated', account);
    res.json(account);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).lean();
    if (!account) return res.status(404).json({ error: 'Account not found' });
    await Assignment.deleteMany({ accountId: req.params.id });
    await Account.findByIdAndDelete(req.params.id);
    await logActivity('deleted_account', 'account', account._id, { before: account });
    req.app.get('io').emit('account:deleted', { _id: req.params.id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
