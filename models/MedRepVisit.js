const mongoose = require("mongoose");

const medRepVisitSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    repName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    productList: { type: String, required: true },

    preferredDate: { type: String },
    preferredTime: { type: String },
    notes: { type: String },

    status: {
      type: String,
      enum: ["new", "scheduled", "completed", "cancelled"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.MedRepVisit ||
  mongoose.model("MedRepVisit", medRepVisitSchema);
