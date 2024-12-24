import { Booking } from "../models/Booking.js";
import { User } from "../models/User.js";

export const createBooking = async (req, res) => {
  try {
    const { instructorId, classDate } = req.body;
    const studentId = req.user.id; // Assuming user is authenticated

    // Validate instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(400).json({ error: "Invalid instructor" });
    }

    // Check instructor availability
    const existingBooking = await Booking.findOne({
      instructor: instructorId,
      classDate,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "Instructor is not available at the selected time" });
    }

    // Create booking
    const booking = new Booking({
      student: studentId,
      instructor: instructorId,
      classDate,
    });
    await booking.save();

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getInstructorAvailability = async (req, res) => {
  try {
    const { instructorId, date } = req.query;

    // Fetch bookings for the given instructor on the specified date
    const bookings = await Booking.find({
      instructor: instructorId,
      classDate: { $gte: new Date(date).setHours(0, 0, 0), $lt: new Date(date).setHours(23, 59, 59) },
      status: { $in: ["pending", "accepted"] },
    });

    const bookedTimes = bookings.map((booking) => booking.classDate);
    res.status(200).json({ success: true, bookedTimes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const query = role === "student" ? { student: userId } : { instructor: userId };
    const bookings = await Booking.find(query).populate("student instructor", "firstName lastName email");

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this booking" });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to cancel this booking" });
    }

    booking.status = "canceled";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Instructor Controllers
export const getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }, "firstName lastName email");
    res.status(200).json({ success: true, instructors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(404).json({ error: "Instructor not found" });
    }

    await User.findByIdAndDelete(instructorId);
    res.status(200).json({ success: true, message: "Instructor removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Get all bookings for a student
export const getStudentBookings = async (req, res) => {
  try {
    const { studentId } = req.params; // Extract studentId from the URL

    // Find all bookings where this student is listed
    const bookings = await Booking.find({ student: studentId })
      .populate("instructor", "firstName lastName email") // Get instructor details
      .sort({ createdAt: -1 }); // Sort bookings by most recent

    // If no bookings are found, return an empty array
    if (!bookings.length) {
      return res.status(200).json({ message: "No bookings found", bookings: [] });
    }

    res.status(200).json({ bookings }); // Send the list of bookings
  } catch (error) {
    res.status(500).json({ message: "Error fetching student bookings", error });
  }
};

// Fetch all bookings for an instructor
export const fetchInstructorBookings = async (req, res) => {
  try {
    const { instructorId } = req.params; // Extract instructorId from the URL

    // Find all bookings where this instructor is listed
    const bookings = await Booking.find({ instructor: instructorId })
      .populate("student", "firstName lastName email") // Get student details
      .sort({ createdAt: -1 }); // Sort bookings by most recent

    // If no bookings are found, return an empty array
    if (!bookings.length) {
      return res.status(200).json({ message: "No bookings found", bookings: [] });
    }

    res.status(200).json({ bookings }); // Send the list of bookings
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructor bookings", error });
  }
}
