import { Request, Response, NextFunction } from "express";
import { readSessionCookie, SessionUser } from "./cookie";


declare global {
    namespace Express {
        interface Request {
            user?: SessionUser;
            
        }
    }   
}

export function requireAuth(req: Request, res: Response, next: NextFunction){
    const user = readSessionCookie(req);
    console.log("inside require auth");
    
    if(!user){
        return res.status(401).json({error: "Unauthenticated"});
    }
    req.user = user;
    next();
}