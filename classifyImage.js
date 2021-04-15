function batchImage(image) {
  // Expand our tensor to have an additional dimension, whose size is 1
  const batchedImage = image.expandDims(0);
  // Turn pixel data into a float between -1 and 1.
  return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
}

function loadAndProcessImage(image) {
  const batchedImage = batchImage(image);
  return batchedImage;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(tf.browser.fromPixels(img));
    img.onerror = (err) => reject(err);
  });
}

function makePrediction(pretrainedModel, image, expectedLabel) {
  loadImage(image)
    .then((loadedImage) => {
      return loadAndProcessImage(loadedImage, pretrainedModel);
    })
    .then((loadedImage) => {
      console.log("Expected Label", expectedLabel);
      console.log("Predicted Label", predict(model, loadedImage));
      loadedImage.dispose();
    });
}
// buildPretrainedModel().then((pretrainedModel) => {
//   loadImages(training, pretrainedModel).then((xs) => {
//     const ys = addLabels(labels);
//     const model = getModel(2);
//     model.fit(xs, ys, { epochs: 20, shuffle: true }).then((history) => {
//       makePrediction(pretrainedModel, blue3, "0");
//       makePrediction(pretrainedModel, red3, "1");
//     });
//   });
// });

mobilenet.load().then((pretrainedModel) => {
  loadImage("http://localhost:8080/dog.jpg").then(async (img) => {
    //const processedImage = loadAndProcessImage(img);
    const prediction = await pretrainedModel.classify(img);
    // Because of the way Tensorflow.js works, you must call print on a Tensor instead of console.log.
    console.log(prediction);
  });
});
