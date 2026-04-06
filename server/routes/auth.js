const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { password } = req.body;
  const sharedPassword = process.env.SHARED_PASSWORD || 'spark2024';

  if (password !== sharedPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ authorized: true }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '30d'
  });

  res.json({ token });
});

module.exports = router;
