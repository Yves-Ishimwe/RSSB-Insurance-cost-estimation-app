const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const pickle = require('pickle');

const app = express();
const PORT = process.env.PORT || 1887;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Set up logger
app.use((req, res, next) => {
  console.log(`${new Date().toString()} => ${req.method} ${req.originalUrl}`);
  next();
});

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/predict', (req, res) => {
  try {
    const {
        age,bmi,children,smoker_encoded,region_encoded,
        Obesity
    } = req.body;

    // Consolidate the inputs
    const inputArgs = [
      parseFloat(age), parseFloat(bmi), parseFloat(children),
      parseFloat(smoker_encoded), parseFloat(region_encoded),
      parseFloat(Obesity)
    ];
    const inputs = [inputArgs]; // 1 row

    // Load the saved model
    const model = pickle.load(fs.readFileSync('saved-models/model4.pkl'));

    const result = model.predict(inputs);

    // Transform result to human-readable
    let prediction, colorSignal;
    switch (parseInt(result)) {
      case 1:
        prediction = 'Category 1';
        colorSignal = 'purple';
        break;
      case 2:
        prediction = 'Category 2';
        colorSignal = 'green';
        break;
      case 3:
        prediction = 'Category 3';
        colorSignal = 'black';
        break;
      default:
        prediction = 'Unknown Category';
        colorSignal = 'gray';
    }

    // Populate flashed messages
    res.status(200).json({ prediction, colorSignal });
  } catch (error) {
    res.status(400).send('Error: Values not valid.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
