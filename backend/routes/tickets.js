// routes/tickets.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const auth = require('../middleware/authMiddleware');

// 📩 Submit a new ticket (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: "Only customers can submit tickets" });
    }

    const newTicket = new Ticket({
      ...req.body,
      customerEmail: req.user.email,
      customerName: req.user.name
    });

    await newTicket.save();
    res.status(201).json({ message: "Ticket submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit ticket" });
  }
});

// 📄 Get all tickets (Agent or Admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only agents or admin can view all tickets" });
    }

    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});


// 👤 Get customer’s own tickets
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: "Only customers can view their tickets" });
    }

    const tickets = await Ticket.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your tickets" });
  }
});

// ✏️ Update a ticket (Agent only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: "Only agents can update tickets" });
    }

    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket" });
  }
});

module.exports = router;
