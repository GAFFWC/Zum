const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const title = document.getElementById("title");

room.hidden = true;

welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const roomName = welcomeForm.querySelector("#room_name");
    const name = welcomeForm.querySelector("#name");

    console.log(roomName.value);
    console.log(name.value);

    socket.emit("enter_room", roomName.value, name.value, () => enterRoom(roomName.value));
});

const enterRoom = (roomName) => {
    welcome.hidden = true;

    room.hidden = false;

    const h3 = room.querySelector("h3");

    h3.innerText = `Room ${roomName}`;

    console.log(`Enter Room : ${roomName}`);

    const messageForm = room.querySelector("#message");
    messageForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = room.querySelector("#message input");
        socket.emit("new_message", input.value, roomName, () => {
            addMessage(`You: ${input.value}`);
            input.value = "";
        });
    });
};

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");

    li.innerText = message;
    ul.appendChild(li);
};

// New User Join
socket.on("welcome", (name) => {
    addMessage(`${name} Joined`);
});

socket.on("bye", (name) => {
    addMessage(`${name} left`);
});

socket.on("new_message", addMessage);
