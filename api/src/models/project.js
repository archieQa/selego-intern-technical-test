const mongoose = require("mongoose");

const MODELNAME = "Project";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

module.exports = mongoose.models[MODELNAME] || mongoose.model(MODELNAME, ProjectSchema);
