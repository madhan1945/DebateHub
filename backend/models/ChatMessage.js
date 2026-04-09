const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    debate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Debate',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['message', 'join', 'leave', 'system'],
      default: 'message',
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ debate: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
