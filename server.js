import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from "./routes/user.routes.js"

// Dotenv
dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());                       

// Add a middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});


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

// Routes
app.use('/api/users', userRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})


