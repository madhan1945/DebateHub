const mongoose = require('mongoose');

const argumentSchema = new mongoose.Schema(
  {
    debate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Debate',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    side: {
      type: String,
      enum: ['support', 'oppose'],
      required: [true, 'Side (support/oppose) is required'],
    },
    content: {
      type: String,
      required: [true, 'Argument content is required'],
      trim: true,
      minlength: [10, 'Argument must be at least 10 characters'],
      maxlength: [3000, 'Argument cannot exceed 3000 characters'],
    },
    referenceLinks: [
      {
        url:   { type: String, trim: true },
        label: { type: String, trim: true, maxlength: 100 },
      },
    ],
    images: [{ type: String }],
    // Parent for threaded replies
    parentArgument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Argument',
      default: null,
    },
    depth: { type: Number, default: 0, max: 3 }, // max 3 nesting levels
    // Vote counts (cached)
    upvotes:   { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    score:     { type: Number, default: 0 }, // upvotes - downvotes
    // Wilson score for ranking (calculated on vote)
    wilsonScore: { type: Number, default: 0 },
    replyCount:  { type: Number, default: 0 },
    isDeleted:   { type: Boolean, default: false },
    isFlagged:   { type: Boolean, default: false },
    flagReason:  { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes
argumentSchema.index({ debate: 1, side: 1, score: -1 });
argumentSchema.index({ debate: 1, createdAt: -1 });
argumentSchema.index({ parentArgument: 1 });
argumentSchema.index({ author: 1 });
argumentSchema.index({ wilsonScore: -1 });

module.exports = mongoose.model('Argument', argumentSchema);
