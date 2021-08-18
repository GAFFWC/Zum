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
app.get("/", (_, res) => res.render("home"));

app.use("/public", express.static(__dirname + "/public"));

app.get("/*", (_, res) => res.redirect("/"));

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

httpServer.listen(3000, () => {
    console.log("Http/Websocket Server Listening on http://localhost:3000");
});

wsServer.on("connection", (socket) => {
    socket
        .on("join_room", (roomName, done) => {
            socket.join(roomName);
            socket.to(roomName).emit("welcome");
        })
        .on("offer", (offer, roomName) => {
            socket.to(roomName).emit("offer", offer);
        })
        .on("answer", (answer, roomName) => {
            socket.to(roomName).emit("answer", answer);
        })
        .on("ice", (ice, roomName) => {
            socket.to(roomName).emit("ice", ice);
        });
});
