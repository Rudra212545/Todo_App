import express from "express";
import {registerUser} from "../controllers/user.controller.js"

const router = express.Router();

// Public Routes 
router.post("/register",registerUser);