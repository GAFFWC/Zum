const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");

const url = "ws://" + window.location.host;
const socket = new WebSocket(url);

socket.addEventListener("open", () => {
    console.log(`Connected to ${url}`);
});

socket.addEventListener("message", (message) => {
    console.log(`New Message : `, message.data);

    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log(`Disonnected from ${url}`);
});

messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = messageForm.querySelector("input");

    socket.send(makeMessage("message", input.value));

    const li = document.createElement("li");
    li.innerText = `You : ${input.value}`;
    messageList.append(li);

    input.value = "";
});

nicknameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = nicknameForm.querySelector("input");

    socket.send(makeMessage("nickname", input.value));

    input.value = "";
});

const makeMessage = (type, payload) => {
    return JSON.stringify({ type, payload });
};
