import { Response } from "express";
import * as jwt from "jsonwebtoken";
import path from "node:path";

export type SessionUser = {
    id: string;
    name: string;
    email: string;
}

function cookieOptions(){
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 1000, // 7 days
    }
}

export function setSessionCookie(res: Response, user: SessionUser){

    const token = jwt.sign(user, process.env.SESSION_JWT_SECRET!,
        {
            algorithm: "HS256",
            expiresIn: "7d"
        }
    );

    res.cookie(process.env.SESSION_COOKIE_NAME!, token, cookieOptions());

}

export function clearSessionCookie(res: Response){
    res.clearCookie(process.env.SESSION_COOKIE_NAME!, cookieOptions());
}

export function readSessionCookie(req: {cookies?: Record<string,string>}){
    const token = req.cookies?.[process.env.SESSION_COOKIE_NAME!];
    if(!token){
        return null;
    }

    try{
        const decodedUser = jwt.verify(token, process.env.SESSION_JWT_SECRET!) as SessionUser;
        return decodedUser;
    }catch{
        return null;
    }

}