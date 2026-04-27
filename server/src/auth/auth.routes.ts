import { Router } from "express";
import { AuthenticationResponse, ScalekitClient } from "@scalekit-sdk/node";
import crypto from "crypto";
import { clearSessionCookie, setSessionCookie } from "./cookie";
import { requireAuth } from "./auth.middleware";
import  extractEnv  from "../utils";

const router = Router();

function makeScalekit(){
    return new ScalekitClient(
        extractEnv("SCALEKIT_ENVIRONMENT_URL") as string,
        extractEnv("SCALEKIT_CLIENT_ID") as string,
        extractEnv("SCALEKIT_CLIENT_SECRET") as string
    )
}

function stateCookieOptions(){
    const isProd = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax" as const,
        path: "/",
        maxAge: 20 * 60 * 1000, // 20 minutes

    }
}

router.get("/login", (req,res)=>{
    try{
        const scalekit = makeScalekit();
        const state = crypto.randomBytes(16).toString("hex");
        res.cookie("sk_oauth_state", state, stateCookieOptions());

        const redirectUri = `${extractEnv("BACKEND_URL")}/auth/callback`;
        const authorizationUrl = scalekit.getAuthorizationUrl(redirectUri, {
            scopes: ["openid", "profile", "email"],
            state
        });

        res.redirect(authorizationUrl);
    }catch(err){
        res.status(500).json({error: `Login failed: ${err as Error}.message`});
    }
})

function getQueryString(value: unknown){
    if(typeof value ==="string"){
        return value;
    }
    return undefined;
}

router.get("/callback", async(req,res)=>{
    try{
        const code = getQueryString(req.query.code);
        const state = getQueryString(req.query.state);
        const error = getQueryString(req.query.error);
        const storedState = req?.cookies["sk_oauth_state"];

        if(error){
            return res.redirect(`${extractEnv("FRONTEND_URL")}/login?error=${encodeURIComponent(error)}`);
        }

        if(!code|| !state){
            return res.status(400).json({error: "Missing code or state in callback"});
        }
        if(!storedState || storedState!=state){
            return res.status(400).json({error: "Invalid state parameter"});
        }

        res.clearCookie("sk_oauth_state", stateCookieOptions());

        const scalekit = makeScalekit();
        const redirectUri = `${extractEnv("BACKEND_URL")}/auth/callback`;

        const authResult : AuthenticationResponse = await scalekit.authenticateWithCode(code, redirectUri);

        console.log("Logging auth response: ",authResult," ", code );

        if(!authResult.user){
            return res.status(500).json({error: "Authentication succeeded but no user info returned"});
        }

        setSessionCookie(res, {
            id: authResult.user.id,
            name: authResult.user.name,
            email: authResult.user.email
        })

        res.redirect(`${extractEnv("FRONTEND_URL")}/support`);

    }catch(err){
        res.status(500).json(
            {
                success: false,
                message: `Authentication failed: ${(err as Error).message}`
            }
        )
    }
})

router.get("/me", requireAuth, async(req,res)=>{
    try{
        res.json({
            user:{
                id: req.user!.id,
                name: req.user!.name,
                email: req.user!.email
            }
        })
    }catch{

    }
})

router.post("/logout", (req, res)=>{
    clearSessionCookie(res);

    res.json({success: true});
})

export default router;