import * as adminService from './admin.service.js';

// Fetches the summarized data for the main dashboard (stats, top 6 requests, etc.)
export const getDashboard = async (req, res, next) => {
    try {
        const data = await adminService.getDashboardData();
        return res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }
};

// NEW: Fetches EVERY request in the database for the "View All" page
export const getRequests = async (req, res, next) => {
    try {
        const data = await adminService.getAllRequests();
        return res.status(200).json({ 
            success: true, 
            data: data 
        });
    } catch (error) {
        console.error("Admin Requests Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch all requests' });
    }
};