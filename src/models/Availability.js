import mongoose from "mongoose";

// Schema for individual time slots
const slotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // Time in format "7:00 AM - 7:30 AM"
  status: {
    type: String,
    enum: ["available", "booked", "unavailable"],
    default: "available",
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  }, // Student who booked the slot
});

// Schema for instructor availability
const availabilitySchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true }, // The specific date for availability
    slots: [slotSchema], // Array of slots for the day
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Availability = mongoose.model("Availability", availabilitySchema);
