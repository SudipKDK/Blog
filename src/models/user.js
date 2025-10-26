/**
 * User Model
 * Defines the User schema and authentication methods
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createTokenForUser } from "../services/authentication.js";
import { config } from "../config/config.js";

// ============================================================================
// USER SCHEMA DEFINITION
// ============================================================================

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    profileImgURL: {
      type: String,
      default: "/images/default_pfp.png",
    },
    role: {
      type: String,
      enum: {
        values: ["USER", "ADMIN"],
        message: 'Role must be either USER or ADMIN'
      },
      default: "USER",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================================================
// SCHEMA MIDDLEWARE
// ============================================================================

/**
 * Hash password before saving to database
 */
userSchema.pre("save", async function (next) {
  const user = this;
  
  // Only hash password if it has been modified
  if (!user.isModified("password")) return next();

  try {
    const hashedPassword = await bcrypt.hash(user.password, config.BCRYPT_ROUNDS);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Authenticate user and generate JWT token
 * @param {string} email - User's email address
 * @param {string} password - User's plain text password
 * @returns {Promise<string>} JWT token
 * @throws {Error} If user not found or password is incorrect
 */
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  // Find user by email
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User not found!");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Incorrect password!");
  }

  // Generate and return JWT token
  const token = createTokenForUser(user);
  return token;
};

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Virtual field for user's full profile URL
 */
userSchema.virtual('fullProfileImgURL').get(function() {
  if (this.profileImgURL.startsWith('http')) {
    return this.profileImgURL;
  }
  return `${process.env.BASE_URL || 'http://localhost:3000'}${this.profileImgURL}`;
});

// ============================================================================
// MODEL EXPORT
// ============================================================================

const User = mongoose.model("User", userSchema);
export default User;
