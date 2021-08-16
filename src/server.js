import express from "express";
import http from "http";
import socketio from "socket.io";
import pug from "pug";
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
const wsServer = new socketio.Server(httpServer);

// wsServer.listen(httpServer, () => {
//     console.log("Websocket Server Listening on ws://localhost:3000");
// });

httpServer.listen(3000, () => {
    console.log("Http/Websocket Server Listening on http://localhost:3000");
});

wsServer.on("connection", (socket) => {
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
        socket.to(roomName).emit("welcome", socket.nickname);
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

    socket.on("new_message", (message, roomName, done) => {
        socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`);
        done();
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname));
    });
});
