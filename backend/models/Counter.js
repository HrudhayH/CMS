const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

/**
 * Get the next sequence value for a given counter.
 * @param {string} name - The counter name (e.g., 'client', 'staff', 'project')
 * @returns {Promise<number>} The next sequence number
 */
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
