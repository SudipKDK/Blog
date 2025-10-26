import JWT from 'jsonwebtoken';
import { config } from '../config/config.js';

export function createTokenForUser(user){
    const payload = {
        _id: user._id,
        email: user.email,
        profileImgURL: user.profileImgURL,
        role: user.role
    };
    const token = JWT.sign(payload, config.JWT_SECRET, { 
        expiresIn: config.JWT_EXPIRES_IN 
    });
    return token;
}

export function validateToken(token){
    try {
        const payload = JWT.verify(token, config.JWT_SECRET);
        return payload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

