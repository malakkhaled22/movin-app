import express from "express";
import { blockUser, getAllUsers, getblockedUsers, unBlockUser } from "../controllers/admin.users.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";
import { approveProperty, rejectProperty, getPendingProperties, getAllPropertiesAdmin } from "../controllers/admin.properties.controller";
import { getAdminStats } from "../controllers/admin.users.controller";
import { adminSearch } from "../controllers/admin.search.controller";
export const router = express.Router(); 

router.patch('/blockuser/:id' , verifyToken , verifyAdmin , blockUser)
router.patch('/unblockuser/:id' , verifyToken , verifyAdmin , unBlockUser)
router.get('/getallusers' , verifyToken , verifyAdmin , getAllUsers)
router.get('/getblockedusers' , verifyToken , verifyAdmin , getblockedUsers)

router.get("/properties/pending", verifyToken, verifyAdmin, getPendingProperties);
router.put("/properties/:id/approve", verifyToken, verifyAdmin, approveProperty);
router.put("/properties/:id/reject", verifyToken, verifyAdmin, rejectProperty);


router.get("/properties/all", verifyToken, verifyAdmin, getAllPropertiesAdmin);
router.get("/search", verifyToken, verifyAdmin, adminSearch);
router.get("/stats", verifyToken, verifyAdmin, getAdminStats);
export default router;
