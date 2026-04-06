const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    argument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Argument',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per user per argument
voteSchema.index({ argument: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
