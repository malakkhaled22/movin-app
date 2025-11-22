import { Request, Response, NextFunction } from "express";

export const allowRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user: any = (req as any).user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const rolesMap: any = {
            admin: user.isAdmin,
            seller: user.isSeller,
            buyer: user.isBuyer,
        };

        const hasRole = allowedRoles.some(role => rolesMap[role] === true);

        if (!hasRole) {
            return res.status(403).json({ message: "Access denied. - Insufficient permissions" });
        }
        next();
    };
};