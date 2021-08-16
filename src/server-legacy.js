import express from "express";
import ws from "ws";
import http from "http";
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
const wsServer = new ws.Server({ server: httpServer });

httpServer.listen(3000, () => {
    console.log("Http Server Listening on http://localhost:3000");
});

wsServer.on("listening", () => {
    console.log("WebSocket Server Listening on ws://localhost:3000");
});

const sockets = [];

wsServer.on("connection", (socket) => {
    socket["nickname"] = "unknown";
    sockets.push(socket);

    console.log("users : ", sockets.length);

    socket.on("close", (code, reason) => {
        console.log(`WebSocket DisConnected from Browser`);
    });

    socket.on("message", (message) => {
        try {
            message = JSON.parse(message.toString());
        } catch (err) {
            console.error(err);
            return;
        }

        console.log("New Message : ", message);

        const { type, payload } = message;

        switch (type) {
            case "nickname":
                console.log(payload);
                socket.nickname = payload;
                break;
            case "message":
                sockets.filter((aSocket) => aSocket.nickname !== socket.nickname).forEach((aSocket) => aSocket.send(`${socket.nickname}: ${payload}`));
                break;
            default:
                break;
        }
    });
});
