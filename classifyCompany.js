
const encodeData = data => {
    const strings = data.map(d => d.text.toLowerCase());
    const encodedData = use.load()
        .then(model => {
            return model.embed(strings)
                .then(embeddings => {
                    return embeddings;
                });
        })
        .catch(err => console.error('Fit Error:', err));

    return encodedData
};

const outputData = tf.tensor2d(trainingData.map(d => [
    d.type === 'company' ? 1 : 0,
    d.type === 'people' ? 1 : 0,
]));

const model = tf.sequential();

// Add layers to the model
model.add(tf.layers.dense({
    inputShape: [512],
    activation: 'sigmoid',
    units: 2,
}));

model.add(tf.layers.dense({
    inputShape: [2],
    activation: 'sigmoid',
    units: 2,
}));

model.add(tf.layers.dense({
    inputShape: [2],
    activation: 'sigmoid',
    units: 2,
}));

// Compile the model
model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.adam(.06), // This is a standard compile config
});

function run() {
    Promise.all([
        encodeData(trainingData),
        encodeData(testingData)
    ])
        .then(data => {
            const {
                0: training_data,
                1: testing_data,
            } = data;

            model.fit(training_data, outputData, { epochs: 200 })
                .then(history => {
                    model.predict(testing_data).print();
                });
        })
        .catch(err => console.log('Prom Err:', err));
};

// Call function
run();