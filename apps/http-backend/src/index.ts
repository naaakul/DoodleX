import * as express from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/src/index"
import { middleware } from "./middelware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/src/types";
import { prismaClient } from "@repo/db/src/index";

const app = express();
app.use(express.json());

app.post("/singup", async (req, res) => {

    const ParsedData = CreateUserSchema.safeParse(req.body);
    if(!ParsedData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: ParsedData.data?.username,
                password: ParsedData.data.password,
                name: ParsedData.data.name
            }
        })
        res.json({
            userId: user.id,
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with the username "
        })
    }

    
})

app.post("/singin", async (req, res) => {
    const ParsedData = SigninSchema.safeParse(req.body);
    if(!ParsedData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }
    // use bycrypt
    const user = await prismaClient.user.findFirst({
        where: {
            email: ParsedData.data.username,
            password: ParsedData.data.password
        }
    })

    if(!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {
    const ParsedData = CreateRoomSchema.safeParse(req.body);
    if(!ParsedData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    const userId = req.userId;

    try{
        const room = await prismaClient.room.create({
            data: {
                slug: ParsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: "123"
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with the name"
        })
    }

})

app.get("chat/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.room.findMany({
        where: {
            id: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    })

    res.json({
        messages
    })
})

app.listen(3001);