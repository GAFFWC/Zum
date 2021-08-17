const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

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
const getMedia = async (constraints = { audio: muted, video: cameraOn && { facingMode: "user" } }) => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia(constraints);

        console.log(myStream);

        myFace.srcObject = myStream;

        if (!constraints?.video?.deviceId) await getCameras();
    } catch (err) {
        console.error(err);
    }
};

getMedia();

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
    await getMedia({ audio: muted, video: { deviceId: { exact: camerasSelect.value } } });
});
