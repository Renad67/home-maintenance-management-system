import { Router } from "express";
import * as requestController from "./request.controller.js";
import { requireAuth } from "../../common/middleware/auth.middleware.js";

const router = Router();

// 1. Submit a new request (THIS IS WHAT WAS MISSING!)
router.post("/", requireAuth, requestController.createRequest);

// 2. Device lookup
router.get("/device-lookup", requireAuth, requestController.getDeviceLookup);

// 3. Get customer's requests
router.get("/user/:userId", requireAuth, requestController.getMyRequests);

export default router;
