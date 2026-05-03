import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes";
import authE2ERoutes from "./auth/e2e.routes";
import cookieParser from "cookie-parser";
import extractEnv from "./utils";

async function main(){
    dotenv.config();
    const app = express();

    app.use(cors({
        origin: extractEnv("FRONTEND_URL"),
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());

    app.get('/status', (req,res)=>{
        res.json({
            ok: true,
            status: "UP"
        });
    })

    app.use("/auth", authRoutes);
    app.use("/auth", authE2ERoutes);

    const port = Number(extractEnv("PORT")) || 5000;
    app.listen(port, ()=>{
        console.log(`Server is running on port ${port}`);
    });
}

main().catch(err => {
    console.error("Failed to start server: ", err);
    process.exit(1);
})

