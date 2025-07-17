const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', require('./routes/user'));
app.use('/api/tickets', require('./routes/tickets'));

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);


// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Start server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
