import { Request , Response , NextFunction } from "express";


export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    try {
        if (!user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        if (!user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();

    } catch (error) {
        console.error("❌ Error in verifyAdmin middleware:", error);
        res.status(500).json({ message: "Server error" });
    }
};
