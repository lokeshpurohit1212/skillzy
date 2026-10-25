const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skillName: {
    type: String,
    required: true,
    trim: true
  },
  currentProficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  targetProficiency: {
    type: String,
    enum: ['Intermediate', 'Advanced', 'Expert'],
    default: 'Advanced'
  },
  weeklyCommitmentHours: {
    type: Number,
    default: 5,
    min: 1,
    max: 40
  },
  targetCompletionDate: {
    type: Date
  },
  learningStyle: {
    type: String,
    default: 'hands-on'
  },
  milestones: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    weeklyGoal: { type: String },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    practiceExercises: [{ type: String }],
    suggestedSessionTopics: [{ type: String }],
    revisionActivities: [{ type: String }],
    order: { type: Number, default: 0 }
  }],
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  generatedBy: {
    type: String,
    enum: ['ai_gemini', 'ai_openai', 'deterministic_engine'],
    default: 'deterministic_engine'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
