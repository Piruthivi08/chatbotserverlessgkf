const mongoose = require("mongoose");

const programApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },

    programType: {
      type: String,
      enum: ["internship", "volunteering"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "under-review", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ProgramApplication ||
  mongoose.model("ProgramApplication", programApplicationSchema);
