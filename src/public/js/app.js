const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const title = document.getElementById("title");

room.hidden = true;

const enterRoom = (roomName) => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");

    h3.innerText = `Room ${roomName}`;

    console.log(`Enter Room : ${roomName}`);
};

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");

    li.innerText = message;
    ul.appendChild(li);
};

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = form.querySelector("input");

    socket.emit("enter_room", input.value, enterRoom);

    input.value = "";
});

// New User Join
socket.on("welcome", () => {
    addMessage("New User Joined");
});
