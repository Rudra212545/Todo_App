import express, { Router } from "express";
import {registerUser , loginUser, logoutUser} from "../controllers/user.controller.js"

const router = express.Router();

// Public Routes 
router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logoutUser);

export default router;