const url = "ws://" + window.location.host;
const socket = new WebSocket(url);

socket.addEventListener("open", () => {
    console.log(`Connected to ${url}`);
});

socket.addEventListener("message", (message) => {
    console.log(`New Message : `, message.data);
});

socket.addEventListener("close", () => {
    console.log(`Disonnected from ${url}`);
});
