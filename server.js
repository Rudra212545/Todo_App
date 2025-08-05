import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from "./routes/user.routes.js"

// Dotenv
dotenv.config();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Database connection
const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB successfully');
  } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
  }
};

connectDB();



app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})


// Routes
app.use('/api/users', userRoutes);