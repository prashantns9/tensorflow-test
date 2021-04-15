var rockCounter = 0;
var paperCounter = 0;
var scissorCounter = 0;
const webcamElement = document.getElementById("webcam");
const constraints = {
  video: true,
};
document.getElementById("rock-btn").addEventListener("click", () => {
  takeASnap().then((blob) => {
    rockCounter++;
    download(blob, "rock" + rockCounter);
  });
});
document.getElementById("paper-btn").addEventListener("click", () => {
  takeASnap().then((blob) => {
    paperCounter++;
    download(blob, "paper" + paperCounter);
  });
});
document.getElementById("scissor-btn").addEventListener("click", () => {
  takeASnap().then((blob) => {
    scissorCounter++;
    download(blob, "scissor" + scissorCounter);
  });
});

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
  webcamElement.srcObject = stream;
});

function takeASnap() {
  const canvas = document.createElement("canvas"); // create a canvas
  const ctx = canvas.getContext("2d"); // get its context
  canvas.width = webcamElement.videoWidth; // set its size to the one of the video
  canvas.height = webcamElement.videoHeight;
  ctx.drawImage(webcamElement, 0, 0); // the video
  return new Promise((res, rej) => {
    canvas.toBlob((blob) => {
      res(blob);
    }, "image/jpeg"); // request a Blob from the canvas
  });
}

function download(blob, name) {
  // uses the <a download> to download a Blob
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name + ".jpg";
  document.body.appendChild(a);
  a.click();
}
