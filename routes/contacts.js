// contact.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Incomplete details' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();
    
    res.status(201).json({ message: 'Message sent successfully', contact: newContact });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
