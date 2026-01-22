import { Request, Response, Router } from "express";
import imagekit from "../config/imagekit";

const router = Router();

router.get("/auth", (_req:Request , res:Response)=>{
    const authParams = imagekit.getAuthenticationParameters();
    res.status(200).json(authParams);
})

export default router;