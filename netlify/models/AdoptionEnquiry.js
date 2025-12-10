const mongoose = require("mongoose");

const adoptionEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    message: { type: String, required: true },

    status: {
      type: String,
      enum: ["new", "in-review", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AdoptionEnquiry ||
  mongoose.model("AdoptionEnquiry", adoptionEnquirySchema);
