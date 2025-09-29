const express = require('express');
const app = express();
const cors = require('cors');
const { initializeDB } = require('./db/db.connect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/user.model');
const Todo = require('./models/todo.model');

const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

async function checkUserExists(req, res, next) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    next();
  }

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from the server');
});


app.post('/register',checkUserExists, async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await User.create({ username, email, password:hashedPassword });
    res.status(201).json({message:"User created successfully"});
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id,email:user.email }, process.env.JWT_SECRET);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  
});

app.post('/add-todo', async (req, res) => {
  const token = req.headers.authorization;
  if(!token) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if(!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { title } = req.body;
  const userId = decoded.userId;
  try {
    await Todo.create({ title, userId:userId });
    res.status(201).json({ message: "Todo added successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/get-todos', async (req, res) => {
  const token = req.headers.authorization;
  if(!token) {
    return res.status(401).json({ message: "Please login to continue" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if(!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = decoded.userId;
  const todos = await Todo.find({ userId:userId });
  res.status(200).json({ todos });
});



app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
  initializeDB();
}); 