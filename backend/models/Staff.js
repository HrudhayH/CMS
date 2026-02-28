const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const staffSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      unique: true,
      sparse: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    role: {
      type: String,
      trim: true,
      default: ''
    },

    department: {
      type: String,
      trim: true,
      default: ''
    },

    password: {
      type: String,
      required: true,
      select: false // Never return password in queries by default
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },

    profilePicture: {
      type: String,
      default: ''
    },
    profileImageUrl: {
      type: String,
      default: null
    },
    profileImagePath: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
staffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
staffSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
