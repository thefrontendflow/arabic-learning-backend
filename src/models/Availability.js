import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availableDates: [
    {
      date: { type: Date, required: true },
      timeSlots: [
        {
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
    },
  ],
});

export const Availability = mongoose.model("Availability", availabilitySchema);
