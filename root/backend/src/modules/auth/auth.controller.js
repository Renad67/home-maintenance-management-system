import * as authService from './auth.service.js';
import { AppError } from '../../common/utils/response/error.response.js';

export const register = async (req, res, next) => {
    try {
        const userId = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId,
        });
    } catch (error) {
        if (error.message === 'Email is already in use') {
            return next(new AppError(error.message, 400));
        }
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,   
            user,
        });
    } catch (error) {
        if (error.message === 'Invalid email or password') {
            return next(new AppError(error.message, 401));
        }
        next(error);
    }
};