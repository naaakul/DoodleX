import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/backend-common/src/index";
import * as jwt from "jsonwebtoken";



export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"] ?? "";
    const decode = jwt.verify(token, JWT_SECRET);

    if(decode && typeof decode === "object" && "userId" in decode) {
        req.userId = decode.userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}