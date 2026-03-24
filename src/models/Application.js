const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    opportunityTitle: {
      type: String,
      required: true,
    },
    resumePath: {
      type: String,
    },
    statementOfInterest: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
      default: 'APPLIED',
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one student can apply only once per opportunity
applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
