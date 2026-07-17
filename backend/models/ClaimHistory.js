import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  userClaim: {
    type: String,
    required: true,
    trim: true
  },
  verdict: {
    type: String,
    enum: ["True", "False", "Misleading", "Chat", "Not Enough Evidence", "Not Yet Happened", "Manipulated/Deepfake", "Propaganda", null]
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null 
  },
  explanation: {
    type: String,
    required: true
  },
  sources: [
    {
      name: String,
      url: String
    }
  ],
  timestamp: {
    type: Date,
    default: Date.now
  }
});


const ChatSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: true,
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER", 
    required: true,
  },
  messages: [MessageSchema] 
}, {
  timestamps: true 
});

export const Factcheck = mongoose.model("Factcheck", ChatSchema);