// const express = require("express");
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

// Generate JWT Token with email and username in payload
export const generateToken = (user) => {
  const payload = {
    id: user._id,        // Unique user identifier
    email: user.email,
    username: user.username
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


// Register user controller 
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (username.length < 6 || username.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Username must be between 6 and 10 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Create new user
        const newUser = new User({ username, email, password });
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser);

        // Set JWT token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // send cookie only over HTTPS in production
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // e.g., 7 days
        });

        // Send response (exclude token from JSON if preferred)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    username: newUser.username,
                    email: newUser.email,
                    createdAt: newUser.createdAt
                }
                // Optionally omit token here as it's in cookie
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// Login User Controller 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set JWT token in HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only set secure flag in production
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response (exclude token from JSON if using cookie)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email
      }
      // you can omit sending token here as it's set in cookie
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Logout Controller 
export const logoutUser = (req, res) => {
    // Clear the 'token' cookie to log the user out
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
  
    res.status(200).json({
      success: true,
      message: 'User logged out successfully, cookie cleared.'
    });
  };


