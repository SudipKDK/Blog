import { validateToken } from "../services/authentication.js";
import User from "../models/user.js"; // Import your User model

export function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies?.[cookieName];
    if (!tokenCookieValue) {
      return next();
    }
    try {
      const userPayload = validateToken(tokenCookieValue);
      
      // Fetch full user data from database
      const user = await User.findById(userPayload._id).select('-password').lean();
      
      if (user) {
        req.user = user;
      } else {
        req.user = undefined;
      }
    } catch (error) {
      console.error('Auth cookie validation error:', error);
      req.user = undefined;
    }
    return next();
  };
}