import * as express from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/src/index"
import { middleware } from "./middelware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/src/types";

const app = express();

app.post("/singup", (req, res) => {

    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    res.json({
        userId: "123"
    })
})

app.post("/singin", (req, res) => {
    const data = SigninSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    res.json({
        roomId: "123"
    })
})

app.listen(3001);