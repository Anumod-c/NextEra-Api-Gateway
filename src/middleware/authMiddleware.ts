import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

const authenticateToken = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('hyy - Middleware initiated');  
    
    const authHeader = req.headers.authorization;
    
  
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('Missing or invalid Authorization header');  
      return res.status(401).json({ message: "Access token is missing or invalid" });
    }

    const token = authHeader.split(" ")[1];  // Extract the token from the header
    
    console.log('Extracted Token:', token);  
    jwt.verify(token, config.JWT_SECRET as string, (err: any, user: any) => {
      if (err) {
        console.log('JWT Verification Error:', err);  
        return res.status(401).json({ message: "Access token expired or invalid" });
      }

      console.log('Verified User:', user);  // Log the user data after successful verification

      // Check if the user's role matches the required role for this route
      if (!requiredRoles.includes(user.role)) {
        console.log('Unauthorized access attempt by user with role:', user.role);  
        return res.status(403).json({ message: "Unauthorized: Access restricted to specific roles" });
      }

      // Attach user data to the request object
      req.user = user;
      console.log('User attached to request:', req.user);  // Confirm the user is attached to the request object

      next();  
      console.log('Next middleware triggered');  
    });
  };
};

export default authenticateToken;
