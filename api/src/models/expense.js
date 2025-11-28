const mongoose = require("mongoose");

const MODELNAME = "Expense";

const ExpenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true, default: "Other" },
  },
  { timestamps: true },
);

module.exports = mongoose.models[MODELNAME] || mongoose.model(MODELNAME, ExpenseSchema);
