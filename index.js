const express = require('express');
const app = express();
const cors = require('cors');
const { initializeDB } = require('./db/db.connect');

const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from the server');
});

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
  initializeDB();
}); 