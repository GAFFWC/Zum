import express from "express";
import http from "http";
import { Server } from "socket.io";
import pug from "pug";
import { instrument } from "@socket.io/admin-ui";
const app = express();

//view engine
app.engine("pug", pug.__express);
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// home
app.get("/", (req, res) => res.render("home"));

app.use("/public", express.static(__dirname + "/public"));

app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

// wsServer.listen(httpServer, () => {
//     console.log("Websocket Server Listening on ws://localhost:3000");
// });

httpServer.listen(3000, () => {
    console.log("Http/Websocket Server Listening on http://localhost:3000");
});

wsServer.on("connection", (socket) => {
    wsServer.sockets.emit("room_change", publicRooms());

    console.log("SOCKET - ", socket.id, socket.connected ? "CONNECTED" : "DISCONNECTED");

    socket["nickname"] = "unknown";

    socket.onAny((event) => {
        console.log("New Event : ", event);
    });

    socket.on("enter_room", (roomName, nickname, done) => {
        socket.nickname = nickname;
        socket.join(roomName);
        done(roomName);
        console.log("SOCKET - ", socket.id, "Joined Room", roomName);
        socket.to(roomName).emit("welcome", socket.nickname, countRoomMembers(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
        done();
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoomMembers(room) - 1));
    });

    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
});

const publicRooms = () => {
    const { sids, rooms } = wsServer.sockets.adapter;
    const publicRooms = [];

    rooms.forEach((_, key) => {
        if (!sids.get(key)) publicRooms.push(key);
    });

    return publicRooms;
};

const countRoomMembers = (roomName) => {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};
