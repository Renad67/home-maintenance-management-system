import * as requestService from "./request.service.js";
import { AppError } from "../../common/utils/response/error.response.js";

// 👉 Make sure this function is here!
export const createRequest = async (req, res, next) => {
  try {
    const result = await requestService.createServiceRequest(req.body);
    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: result,
    });
  } catch (error) {
    // 👇 THIS WILL REVEAL THE HIDDEN DATABASE ERROR! 👇
    console.error("🔥 CRASH REPORT:", error);
    next(error);
  }
};

export const getDeviceLookup = async (req, res, next) => {
  try {
    const { category, brand } = req.query;
    const device_id = await requestService.lookupDeviceId(category, brand);

    if (!device_id) {
      return res
        .status(404)
        .json({ success: false, message: "Device not found" });
    }

    return res.status(200).json({ success: true, data: { device_id } });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requests = await requestService.getRequestsByUser(userId);
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};
