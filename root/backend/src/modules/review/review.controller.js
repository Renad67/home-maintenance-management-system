import * as reviewService from './review.service.js';

export const submitReview = async (req, res, next) => {
    try {
        const reviewId = await reviewService.submitReview(req.body);
        return res.status(201).json({ 
            success: true, 
            message: 'Review submitted successfully',
            data: { reviewId }
        });
    } catch (error) {
        console.error("🔥 CRASH REPORT (Review Submit):", error);
        next(error);
    }
};

export const getMyReviews = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const reviews = await reviewService.getCustomerReviews(userId);
        return res.status(200).json({ 
            success: true, 
            data: reviews 
        });
    } catch (error) {
        console.error("🔥 CRASH REPORT (Fetch Reviews):", error);
        next(error);
    }
};

export const getTechReviews = async (req, res, next) => {
    try {
        const { techId } = req.params;
        const reviews = await reviewService.getTechnicianReviews(techId);
        return res.status(200).json({ 
            success: true, 
            data: reviews 
        });
    } catch (error) {
        console.error("🔥 CRASH REPORT (Fetch Tech Reviews):", error);
        next(error);
    }
};

export const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await reviewService.getAllReviews();
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
};