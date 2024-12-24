import { AddOrUpdateAvailability, getInstructorAvailability } from "../controllers/availabilityController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get('/', authMiddleware, AddOrUpdateAvailability);
router.get('/:instructorId', authMiddleware, getInstructorAvailability);

export default router;