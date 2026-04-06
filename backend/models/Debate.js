const mongoose = require('mongoose');

const debateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Debate title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Education', 'Environment', 'Business', 'Politics', 'Science', 'Health', 'Society', 'Culture', 'Sports', 'Other'],
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bannerImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    startTime: { type: Date, default: Date.now },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    // Cached counts for performance
    supportCount: { type: Number, default: 0 },
    opposeCount:  { type: Number, default: 0 },
    totalArguments: { type: Number, default: 0 },
    totalVotes:     { type: Number, default: 0 },
    viewCount:      { type: Number, default: 0 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    isFlagged:  { type: Boolean, default: false },
    flagReason: { type: String, default: '' },
    winner: {
      type: String,
      enum: ['support', 'oppose', 'tie', null],
      default: null,
    },
  },
  { timestamps: true }
);

// Auto-close expired debates
debateSchema.methods.checkAndClose = async function () {
  if (this.status === 'active' && this.endTime < new Date()) {
    this.status = 'closed';
    // Determine winner
    if (this.supportCount > this.opposeCount)     this.winner = 'support';
    else if (this.opposeCount > this.supportCount) this.winner = 'oppose';
    else                                            this.winner = 'tie';
    await this.save();
  }
  return this;
};

// Index for search and sorting
debateSchema.index({ title: 'text', description: 'text', tags: 'text' });
debateSchema.index({ category: 1, status: 1 });
debateSchema.index({ createdAt: -1 });
debateSchema.index({ totalVotes: -1 });
debateSchema.index({ endTime: 1, status: 1 });

module.exports = mongoose.model('Debate', debateSchema);
