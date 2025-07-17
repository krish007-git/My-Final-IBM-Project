const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'agent', 'admin'],
    required: true
  },
  active: {
    type: Boolean,
    default: true  // Used to block/deactivate users
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
