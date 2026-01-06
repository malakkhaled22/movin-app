import express from "express";
import { blockUser, getAllUsers, getblockedUsers, unBlockUser } from "../controllers/admin.users.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";
import { approveProperty, rejectProperty, getPendingProperties, getAllPropertiesAdmin } from "../controllers/admin.properties.controller";
import { getAdminStats } from "../controllers/admin.users.controller";
import { adminSearch } from "../controllers/admin.search.controller";
export const router = express.Router(); 

router.patch('/users/block/:id' , verifyToken , verifyAdmin , blockUser)
router.patch('/users/unblock/:id' , verifyToken , verifyAdmin , unBlockUser)
router.get('/users/all' , verifyToken , verifyAdmin , getAllUsers)
router.get('users/blocked' , verifyToken , verifyAdmin , getblockedUsers)

router.get("/properties/all", verifyToken, verifyAdmin, getAllPropertiesAdmin);
router.get("/properties/pending", verifyToken, verifyAdmin, getPendingProperties);
router.put("/properties/approve/:id", verifyToken, verifyAdmin, approveProperty);
router.put("/properties/reject/:id", verifyToken, verifyAdmin, rejectProperty);


router.get("/search", verifyToken, verifyAdmin, adminSearch);
router.get("/stats", verifyToken, verifyAdmin, getAdminStats);
export default router;
