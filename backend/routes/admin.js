const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ---------------------- Ticket Routes ----------------------

router.get("/tickets", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

router.get("/ticket-stats", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const open = await Ticket.countDocuments({ status: "open" });
    const inProgress = await Ticket.countDocuments({ status: "in-progress" });
    const resolved = await Ticket.countDocuments({ status: "resolved" });

    res.json({ open, inProgress, resolved });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// ---------------------- User Management Routes ----------------------

router.get("/users", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.put("/users/:id/block", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    res.json({ message: "User deactivated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate user" });
  }
});

router.delete("/users/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Unblock user
router.put("/users/:id/unblock", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { active: true },
      { new: true }
    );
    res.json({ message: "User unblocked", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to unblock user" });
  }
});


// ---------------------- Admin Profile Update ----------------------

router.put("/update-profile", auth, upload.single("profileImage"), async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { name } = req.body;
  const updateFields = { name };
  if (req.file) updateFields.profileImage = `/uploads/${req.file.filename}`;

  try {
    const updated = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
