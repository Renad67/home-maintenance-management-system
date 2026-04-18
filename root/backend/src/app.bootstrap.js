import express from 'express';
import authRouter from './modules/auth/auth.router.js';
import requestRouter from './modules/request/request.router.js';
import taskRouter from './modules/task/task.router.js';
import reviewRouter from './modules/review/review.router.js';
import adminRouter from './modules/admin/admin.router.js';
import cors from 'cors';
export const bootstrap = (app) => {
    app.use(cors());
    app.use(express.json());

    app.use('/api/auth', authRouter);
    app.use('/api/requests', requestRouter);
    app.use('/api/tasks', taskRouter);
    app.use('/api/reviews', reviewRouter);
    app.use('/api/admin', adminRouter);


    app.use((req, res, next) => {
        const error = new Error(`Route ${req.originalUrl} not found`);
        error.statusCode = 404;
        next(error);
    });

    app.use((err, req, res, next) => {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: err.message || 'Internal Server Error'
        });
    });
};