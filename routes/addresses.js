const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Forbidden: No token provided or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Add new address
router.post('/add', authenticateToken, async (req, res) => {
  const { combinedAddress } = req.body;
  const [street, city, state, country, postalCode] = combinedAddress.split(',').map(item => item.trim());

  try {
    if (!street || !city || !state || !country || !postalCode) {
      return res.status(400).json({ error: 'Incomplete address' });
    }

    const address = new Address({
      street,
      city,
      state,
      country,
      postalCode,
      user: req.user.id
    });

    await address.save();
    res.status(201).json({ message: 'Address added successfully', address });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get addresses for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json(addresses);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
