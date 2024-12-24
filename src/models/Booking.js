import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "canceled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
