export const successResponse = (res, { data = null, message = 'Success', status = 200 } = {}) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};

export const createdResponse = (res, { data = null, message = 'Created successfully' } = {}) => {
    return successResponse(res, { data, message, status: 201 });
};