import express, { Router } from "express";
import { blockUser, getAllUsers, getblockedUsers, unBlockUser } from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { verifyAdmin } from "../middlewares/admin.middleware";
export const adminRouter = express.Router(); 
adminRouter.patch('/admin/blockuser/:id' , verifyToken , verifyAdmin , blockUser)
adminRouter.patch('/admin/unblockuser/:id' , verifyToken , verifyAdmin , unBlockUser)
adminRouter.get('/admin/getallusers' , verifyToken , verifyAdmin , getAllUsers)
adminRouter.get('/admin/getblockedusers' , verifyToken , verifyAdmin , getblockedUsers)
