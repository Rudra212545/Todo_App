import express, { Router } from "express";
import {registerUser , loginUser} from "../controllers/user.controller.js"

const router = express.Router();

// Public Routes 
router.post("/register",registerUser);
router.post("/login",loginUser);

export default router;