const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['INTERNSHIP', 'FULL-TIME', 'RESEARCH'],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Remote', 'On-Campus', 'Hybrid'],
      required: true,
    },
    stipend: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    eligibility: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    applyUrl: {
      type: String,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ deadline: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
