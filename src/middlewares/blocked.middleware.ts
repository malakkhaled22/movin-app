import { NextFunction, Request , Response } from "express"
export const blockCheck = async (req:Request , res:Response , next:NextFunction) => {
     const blockedUser = (req.user as any).isBlocked;
        if(blockedUser) return res.status(403).json({message:'User is blocked , accsess dined'})
        next();
};