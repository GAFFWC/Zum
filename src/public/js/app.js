const socket = io();

// welcome Form (join)
let roomName;

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const init = async () => {
    await getMedia();
    welcome.hidden = true;
    call.hidden = false;
    makeConnection();
};

welcomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await init();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
});

// Socket Code
socket
    .on("welcome", async () => {
        console.log("someone joined");
        const offer = await peerConnection.createOffer();
        console.log(offer);
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
        console.log("sent the offer");
    })
    .on("offer", async (offer) => {
        console.log("received the offer");
        await peerConnection.setRemoteDescription(offer);

        const answer = await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(answer);

        socket.emit("answer", answer, roomName);
    })
    .on("answer", async (answer) => {
        console.log("received answer");
        await peerConnection.setRemoteDescription(answer);
    })
    .on("ice", async (ice) => {
        console.log("received ice candidate");

        await peerConnection.addIceCandidate(ice);
    });
// Video

const call = document.getElementById("call");

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

call.hidden = true;

let myStream;
let muted = false;
let cameraOn = true;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if (currentCamera.label == camera.label) option.selected = true;

            camerasSelect.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
};
const getMedia = async (constraints = { audio: !muted, video: cameraOn && { facingMode: "user" } }) => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(constraints);

        myFace.srcObject = myStream;

        if (!constraints?.video?.deviceId) await getCameras();
    } catch (err) {
        console.error(err);
    }
};

muteBtn.addEventListener("click", (_) => {
    muted = !muted;
    muteBtn.innerText = muted ? "Unmute" : "Mute";
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
});

cameraBtn.addEventListener("click", (_) => {
    cameraOn = !cameraOn;
    cameraBtn.innerText = cameraOn ? "Camera Off" : "Camera On";
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
});

camerasSelect.addEventListener("input", async (_) => {
    await getMedia({ audio: !muted, video: { deviceId: { exact: camerasSelect.value } } });
    if (peerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = peerConnection.getSenders().find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
});

// RTC codes
let peerConnection;

const makeConnection = () => {
    peerConnection = new RTCPeerConnection();
    peerConnection.addEventListener("icecandidate", (data) => {
        socket.emit("ice", data.candidate, roomName);
        console.log("sent ice candidate");
    });

    peerConnection.addEventListener("addstream", (data) => {
        const peersStream = document.getElementById("peersFace");
        peersStream.srcObject = data.stream;
    });

    myStream.getTracks().forEach((track) => peerConnection.addTrack(track, myStream));
};
