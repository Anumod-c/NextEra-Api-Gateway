import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
console.log('midleee',token)
    jwt.verify(token, config.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: "Access token expired, please refresh token" });
        }
       // Optionally attach user data to the request object
       // req.user = user;
        next();
    });
}

export default authenticateToken;
