const mongoose = require("mongoose");

const ChatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    intent: { type: String, default: null },
    step: { type: Number, default: 0 },
    data: { type: Object, default: {} }
  },
  { timestamps: true }
);

// Auto-delete sessions older than 24 hours
ChatSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

module.exports =
  mongoose.models.ChatSession ||
  mongoose.model("ChatSession", ChatSessionSchema);
