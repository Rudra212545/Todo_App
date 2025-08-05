import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 10,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        
    },
    task: {
        type: mongoose.Types.ObjectId,
        ref: "Task"
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    // Validate original password length before hashing
    if (this.password.length < 8) {
        return next(new Error('Password must be at least 8 characters long'));
    }
    
    try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create the model
const User = mongoose.model('User', userSchema);

export default User;
