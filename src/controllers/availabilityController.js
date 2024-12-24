import { Availability } from "../models/Availability.js";

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
