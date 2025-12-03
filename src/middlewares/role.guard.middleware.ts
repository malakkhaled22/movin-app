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

export const isBuyer = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user || !user.isBuyer) {
        return res.status(403).json({ error: "Access denied. Buyer account required only." });
    }
    next();
}

export const isSeller = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;

    if (!user || !user.isSeller) {
        return res.status(403).json({ error: "Access denied. Seller account required only." });
    }
}