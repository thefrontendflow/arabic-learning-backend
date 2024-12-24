import {
  cancelBooking,
  createBooking,
  fetchInstructorBookings,
  getBookings,
  getInstructorAvailability,
  getStudentBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/availability", getInstructorAvailability);
router.get("/", authMiddleware, getBookings);
router.patch("/:bookingId", authMiddleware, updateBookingStatus);
router.delete("/:bookingId", authMiddleware, cancelBooking);
router.get("/student/:studentId", authMiddleware, getStudentBookings);
router.get(
  "/instructor/:instructorId",
  authMiddleware,
  fetchInstructorBookings
);

export default router;
