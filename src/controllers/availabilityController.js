import { Availability } from "../models/Availability.js";
import { generateSlots } from "../utils/slotGenerator.js";

export const setAvailability = async (req, res) => {
  try {
    const { date, startTime = "07:00", endTime = "22:00" } = req.body; // Default time range
    const instructorId = req.user.id; // Assuming the authenticated instructor's ID is in req.user.id

    // Convert date and time strings to Date objects
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Validate input
    if (startDateTime >= endDateTime) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time." });
    }

    // Generate slots
    const slots = generateSlots(startDateTime, endDateTime);

    // Check if availability already exists for this date and instructor
    const existingAvailability = await Availability.findOne({
      instructor: instructorId,
      date: new Date(date),
    });

    if (existingAvailability) {
      return res
        .status(400)
        .json({ message: "Availability already exists for this date." });
    }

    // Save the availability to the database
    const newAvailability = new Availability({
      instructor: instructorId,
      date: new Date(date),
      slots,
    });

    await newAvailability.save();

    res
      .status(201)
      .json({
        message: "Availability created successfully.",
        availability: newAvailability,
      });
  } catch (error) {
    console.error("Error setting availability:", error);
    res
      .status(500)
      .json({ message: "An error occurred while setting availability." });
  }
};

// Add or Update Availability for an Instructor
export const AddOrUpdateAvailability = async (req, res) => {
  try {
    const { instructor, availableDates } = req.body;

    // Check if the instructor already has availability set
    let availability = await Availability.findOne({ instructor });

    if (!availability) {
      // Create new availability
      availability = new Availability({ instructor, availableDates });
    } else {
      // Update existing availability
      availability.availableDates = availableDates;
    }

    await availability.save();
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Error saving availability", error });
  }
};

// Get Availability for an Instructor
export const getInstructorAvailability = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const availability = await Availability.findOne({
      instructor: instructorId,
    });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: "Error fetching availability", error });
  }
};
