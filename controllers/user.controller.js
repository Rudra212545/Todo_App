// const express = require("express");
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

// Generate JWT Token with email and username in payload
const generateToken = (user) => {
    const payload = {
        email: user.email,
        username: user.username
    };
    
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};


// Register User Controller
export const registerUser = async (req, res) => {
    // 🔍 Debug logs - add these temporarily
    console.log('Content-Type:', req.headers['content-type']);
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    try {
        const { username, email, password } = req.body;
        console.log('Extracted:', { username, email, password });

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email, and password'
            });
        }

        // Validate password length (before hashing)
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Validate username length
        if (username.length < 6 || username.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Username must be between 6 and 10 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === email 
                    ? 'Email already registered' 
                    : 'Username already taken'
            });
        }

        // Create new user (password will be hashed by pre-save middleware)
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();

        // Generate JWT token with user data
        const token = generateToken(newUser);

        // Return success response (exclude password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    username: newUser.username,
                    email: newUser.email,
                    createdAt: newUser.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error (in case unique constraint fails)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        // Handle validation errors
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




