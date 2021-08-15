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

wsServer.on("connection", (socket) => {
    console.log(`Connected to Browser`);

    socket.on("close", (code, reason) => {
        console.log(`WebSocket DisConnected from Browser`);
    });

    socket.on("message", (message) => {
        console.log("New Message : ", message.toString("utf-8"));
    });
});
