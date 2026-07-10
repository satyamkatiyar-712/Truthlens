import mongoose from "mongoose"
const ClaimSchema = new mongoose.Schema({
  userClaim: {
    type: String,
    required: true,
    trim: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ["True", "False", "Misleading", "Chat", "Not Enough Evidence", "Not Yet Happened","Manipulated/Deepfake","Propaganda"]
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100 
  },
  explanation: {
    type: String,
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER", // Ye naam tere User model ke naam se exactly match hona chahiye (jaise tune export const USER = mongoose.model("USER", ...))
        required: true,
    },
  sources: [
    {
      name: String,
      url: String
    }
  ]

},

  {
    timestamps: true
  })

export const Factcheck = mongoose.model("Factcheck", ClaimSchema)