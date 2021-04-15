var trainingData = {
  rockImages: [],
  paperImages: [],
  scissorImages: [],
};

function getHtmlImageElement(url) {
  return new Promise((resolve, reject) => {
    let imgEl = document.createElement("img");
    imgEl.onload = () => {
      resolve(imgEl);
    };
    imgEl.src = url;
  });
}

async function loadTrainingData() {
  for (let i = 1; i <= 50; i++) {
    let rockImageEl = await getHtmlImageElement(
      `http://localhost:8080/rock/rock${i}.jpg`
    );
    if (rockImageEl) {
      trainingData.rockImages.push(rockImageEl);
    }
  }

  for (let i = 1; i <= 50; i++) {
    let paperImageEl = await getHtmlImageElement(
      `http://localhost:8080/paper/paper${i}.jpg`
    );
    if (paperImageEl) {
      trainingData.paperImages.push(paperImageEl);
    }
  }

  for (let i = 1; i <= 50; i++) {
    let scissorImageEl = await getHtmlImageElement(
      `http://localhost:8080/scissor/scissor${i}.jpg`
    );
    if (scissorImageEl) {
      trainingData.scissorImages.push(scissorImageEl);
    }
  }
}

async function app() {
  // start camera
  const webcamElement = document.getElementById("webcam");
  const constraints = {
    video: true,
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    webcamElement.srcObject = stream;
  });

  const classes = ["Rock", "Paper", "Scissor"];

  console.log("Loading mobilenet..");
  net = await mobilenet.load();
  console.log("Successfully mobilenet model");

  const classifier = knnClassifier.create();
  const webcam = await tf.data.webcam(webcamElement);

  await loadTrainingData();
  console.log("loaded training data success");
  console.log(trainingData);

  const train = async () => {
    let rockCounter = 0;
    let paperCounter = 0;
    let scissorCounter = 0;

    for (let i = 0; i < 150; i++) {
      if (i % 3 === 0) {
        const activation = net.infer(
          trainingData.rockImages[rockCounter],
          true
        );
        classifier.addExample(activation, 0);
        rockCounter++;
      } else if (i % 3 === 1) {
        const activation = net.infer(
          trainingData.paperImages[paperCounter],
          true
        );
        classifier.addExample(activation, 1);
        paperCounter++;
      } else if (i % 3 === 2) {
        const activation = net.infer(
          trainingData.scissorImages[scissorCounter],
          true
        );
        classifier.addExample(activation, 2);
        scissorCounter++;
      }
    }
    console.log("counters", rockCounter, paperCounter, scissorCounter);
  };
  await train();
  console.log("done training");

  console.log("starting to predict now.");
  while (true) {
    if (classifier.getNumClasses() > 0) {
      const img = await webcam.capture();

      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(img, "conv_preds");
      // Get the most likely class and confidence from the classifier module.
      const result = await classifier.predictClass(activation);

      document.getElementById("console").innerText = `
            Rock: ${result.confidences[0] * 100} %\n
            Paper: ${result.confidences[1] * 100} %\n
            Scissor: ${result.confidences[2] * 100} %\n
          `;
      // Dispose the tensor to release the memory.
      img.dispose();
    }

    await tf.nextFrame();
  }
}
app();
