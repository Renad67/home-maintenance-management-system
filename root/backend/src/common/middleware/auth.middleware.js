import jwt from 'jsonwebtoken';
import { AppError } from '../utils/response/error.response.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Session expired. Please log in again.', 401));
        }
        return next(new AppError('Invalid token. Please log in.', 401));
    }
};

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this resource.', 403));
        }
        next();
    };
};