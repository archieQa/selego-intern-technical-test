const mongoose = require("mongoose");

const MODELNAME = "Invite";

const InviteSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    token: { type: String, required: true }, // token for verification
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.models[MODELNAME] || mongoose.model(MODELNAME, InviteSchema);
