import { Router } from 'express';
import { setSessionCookie } from './cookie';

const router = Router();


function checkE2EMode(){
    const isProd = process.env.NODE_ENV === "production";
    const enabled = process.env.E2E_TEST_MODE === "true";

    if(isProd && !enabled){
        return false;
    }
    return true;
}

router.post("/e2e/login", (req, res) => {
    if(!checkE2EMode()){
        return res.status(404).json({error: "E2E test mode is not enabled"});
    }

    // creating a dummy user for testing purposes if the req is empty, otherwise use the provided user data

    const name = 
        typeof req.body?.name === "string" && req.body.name.trim() !== ""
            ? req.body.name.trim()
            : "Test User";

    const email =
        typeof req.body?.email === "string" && req.body.email.trim() !== ""
            ? req.body.email.trim()
            : "e2e@test.com";

    const id = 
        typeof req.body?.id === "string" && req.body.id.trim() !== "" 
            ? req.body.id.trim()
            : "e2e-user-id";

    setSessionCookie(res, { id, name, email });

    return res.json({ok: true, message: "E2E login successful"});
    
});

router.post("/e2e/logout", (req, res) => {
    if(!checkE2EMode()){
        return res.status(404).json({error: "E2E test mode is not enabled"});
    }
    res.clearCookie(process.env.SESSION_COOKIE_NAME!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
    return res.json({ok: true, message: "E2E logout successful"});
});

export default router;