import authRoutes from './routes/authRoutes.js'
import availabilityRoutes from "./routes/availabilityRoutes.js"
import bookingRoutes from './routes/bookingRoutes.js';
import { connectDB } from "./config/db.js";
import cors from 'cors';
import dotenv from "dotenv";
import express from 'express';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.get("/api/health-check", (req, res) => {
  res.status(200).json({
    success: true,
    message: "The server is up and running",
  })
});


const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
