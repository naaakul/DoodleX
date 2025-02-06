import { WebSocketServer, WebSocket } from 'ws';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/src';
import { prismaClient } from "@repo/db/src/index";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    usetId: string;
    rooms: string[];
    ws: WebSocket;
}

const users: User[] = [];  

function checkUser(token : string): string | null {
    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        if(typeof decoded == "string"){
            return null;
        }

        if(!decoded || !decoded.usetId) {
            return null;
        }

        return decoded.usetId;
    }
    catch(e){
        return null;
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    
    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const usetId = checkUser(token);

    if(usetId == null){
        ws.close();
        return null;
    }

    users.push({
        usetId,
        rooms: [],
        ws
    })

    ws.on('message', async function message(data) {
      const parsedData = JSON.parse(data as unknown as string);

      if(parsedData.type === "join_room") {
        const user = users.find(x => x.ws === ws);
        user?.rooms.push(parsedData.roomId);
      }

      if(parsedData.type === "leave_room") {
        const user = users.find(x => x.ws === ws);
        if(!user){
            return;
        }
        user.rooms = user?.rooms.filter(x => x === parsedData.roomId);
      }

      if(parsedData.type === "chat"){
        const roomId = parsedData.roomId;
        const message = parsedData.message;

        await prismaClient.chat.create({
            data: {
                roomId,
                message,
                usetId
            }
        })

        users.forEach(user => {
            if(user.rooms.includes(roomId)){
                user.ws.send(JSON.stringify({
                    type: "chat",
                    message: message,
                    roomId
                }))
            }
        })
      }
    });
});